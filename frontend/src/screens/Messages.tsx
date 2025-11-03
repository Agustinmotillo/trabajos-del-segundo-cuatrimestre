import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

/* ==== ENDPOINTS ==== */
const PRIMARY_GET_CLIENTS = '/users/clients';
const FALLBACK_GET_CLIENTS = '/users?role=CLIENTE';
const GET_THREAD_WITH = (id: number | string) => `/messages/with/${id}`;
const SEND_MESSAGE_ENDPOINT = '/messages';

// para cliente/vet buscar recepcionistas
const PRIMARY_GET_RECEPTION = '/users/recepcionistas';
const FALLBACK_GET_RECEPTION = '/users?role=RECEPCIONISTA';

// Badges & leído
const GET_UNREAD_FOR_ME = '/messages/unread/for-me';
const MARK_READ_WITH = (id: number | string) => `/messages/mark-read/${id}`;

type UserLite = { id: number; name: string; email?: string };
type Msg = {
  id: number;
  from_id: number;
  to_id: number;
  text: string;
  created_at?: string;
};

export default function Messages() {
  const { user, authFetch } = useAuth();
  const role = user?.role;

  // comunes
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Msg>>(null);

  // recepcionista
  const [mode, setMode] = useState<'list' | 'chat'>('list');
  const [clients, setClients] = useState<UserLite[]>([]);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [selected, setSelected] = useState<UserLite | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // no leídos por cliente (solo para recepcionista)
  const [unreadBy, setUnreadBy] = useState<Record<number, number>>({});

  // recepcionista (auto-refresh del hilo abierto)
  useEffect(() => {
    if (!selected || role !== 'RECEPCIONISTA') return;
    const id = setInterval(() => loadThread(selected.id), 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, role]);

  // helper fetch
  const fetchJSON = async (path: string, init?: any) => {
    const r = await authFetch(path, init);
    let body: any = {};
    try {
      body = await r.json();
    } catch {}
    (body as any).__status = r.status;
    return body;
  };

  const loadClients = async () => {
    setErr('');
    setLoading(true);
    try {
      let d = await fetchJSON(PRIMARY_GET_CLIENTS);
      if (d.__status === 404 || (!d?.items && !Array.isArray(d))) {
        d = await fetchJSON(FALLBACK_GET_CLIENTS);
      }
      const arr = Array.isArray(d?.items) ? d.items : (Array.isArray(d) ? d : []);
      setClients(arr as UserLite[]);
    } catch (e: any) {
      setErr(e?.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // contadores de no leídos
  const loadUnread = async () => {
    try {
      const r = await authFetch(GET_UNREAD_FOR_ME);
      const d = await r.json().catch(() => ({}));
      if (d?.ok) {
        const map: Record<number, number> = {};
        (d.by_sender || []).forEach((row: any) => {
          map[Number(row.user_id)] = Number(row.n || 0);
        });
        setUnreadBy(map);
      }
    } catch {}
  };

  const loadThread = async (otherId: number) => {
    setErr('');
    try {
      const d = await fetchJSON(GET_THREAD_WITH(otherId));
      const items = d?.items || d || [];
      setMsgs(items);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar el chat');
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    try {
      if (selected) {
        const r = await authFetch(SEND_MESSAGE_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({ to_user_id: selected.id, text }),
        });
        if (!r.ok && r.status && r.status >= 400) throw new Error('Fallo al enviar');
        setInput('');
        setMsgs((m) => [...m, { id: Date.now(), from_id: user!.id, to_id: selected.id, text }]);
      } else {
        const r = await authFetch(SEND_MESSAGE_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify({ to_role: 'RECEPCIONISTA', text }),
        });
        if (!r.ok && r.status && r.status >= 400) throw new Error('Fallo al enviar');
        setInput('');
        setMsgs((m) => [...m, { id: Date.now(), from_id: user!.id, to_id: 0, text }]);
      }
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el mensaje');
    }
  };

  /* ================= RECEPCIONISTA ================= */
  useEffect(() => {
    if (role === 'RECEPCIONISTA') {
      loadClients();
      loadUnread();
      const id = setInterval(loadUnread, 10000);
      return () => clearInterval(id);
    }
  }, [role]);

  if (role === 'RECEPCIONISTA') {
    // 👉 “Bandeja” solo con los que tienen no leídos
    const inbox = clients.filter((c) => (unreadBy[c.id] || 0) > 0);

    if (mode === 'list') {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
          <View style={{ padding: 14 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 12 }}>
              Mensajes (Clientes)
            </Text>

            {/* Selector (sigue estando disponible) */}
            <View style={{ marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setClientsOpen((v) => !v)}
                activeOpacity={0.9}
                style={{
                  borderWidth: 1,
                  borderColor: '#cbd5e1',
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontWeight: '600' }}>
                  {clientsOpen ? 'Elegir cliente ▴' : 'Elegir cliente ▾'}
                </Text>
                <Text style={{ opacity: 0.7 }}>👥</Text>
              </TouchableOpacity>

              {clientsOpen && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#cbd5e1',
                    borderTopWidth: 0,
                    backgroundColor: '#fff',
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    overflow: 'hidden',
                  }}
                >
                  {loading && <Text style={{ padding: 12, color: '#64748b' }}>Cargando…</Text>}
                  {!loading && clients.length === 0 && (
                    <View style={{ padding: 12 }}>
                      <Text style={{ color: '#64748b' }}>No hay clientes.</Text>
                      <TouchableOpacity
                        onPress={loadClients}
                        style={{ marginTop: 8, alignSelf: 'flex-start', padding: 6 }}
                      >
                        <Text style={{ color: '#0f766e', fontWeight: '700' }}>Reintentar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {!loading &&
                    clients.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        onPress={async () => {
                          setSelected(c);
                          setMode('chat');
                          setClientsOpen(false);
                          await loadThread(c.id);
                          await authFetch(MARK_READ_WITH(c.id), { method: 'POST' });
                          loadUnread();
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('messages:read'));
                          }
                        }}
                        activeOpacity={0.9}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          borderTopWidth: 1,
                          borderTopColor: '#f1f5f9',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>👤</Text>
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flexShrink: 1 }}>
                            <Text style={{ fontWeight: '700' }}>{c.name}</Text>
                            {c.email ? (
                              <Text style={{ color: '#64748b', fontSize: 12 }}>{c.email}</Text>
                            ) : null}
                          </View>
                          {unreadBy[c.id] > 0 && (
                            <View
                              style={{
                                marginLeft: 8,
                                minWidth: 18,
                                height: 18,
                                borderRadius: 9,
                                backgroundColor: '#ef4444',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 6,
                              }}
                            >
                              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>
                                {unreadBy[c.id]}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Texto guía */}
            <Text style={{ color: '#64748b', marginBottom: 10 }}>
              Elegí un cliente para abrir el chat.
            </Text>

            {/* -------- BANDEJA: chats con mensajes nuevos -------- */}
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontWeight: '800', marginBottom: 8 }}>Chats con mensajes nuevos</Text>

              {inbox.length === 0 ? (
                <Text style={{ color: '#64748b' }}>No hay mensajes nuevos.</Text>
              ) : (
                inbox.map((c) => (
                  <TouchableOpacity
                    key={`inbox-${c.id}`}
                    onPress={async () => {
                      setSelected(c);
                      setMode('chat');
                      await loadThread(c.id);
                      await authFetch(MARK_READ_WITH(c.id), { method: 'POST' });
                      loadUnread();
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('messages:read'));
                      }
                    }}
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>💬</Text>
                      <View>
                        <Text style={{ fontWeight: '700' }}>{c.name}</Text>
                        {c.email ? (
                          <Text style={{ color: '#64748b', fontSize: 12 }}>{c.email}</Text>
                        ) : null}
                      </View>
                    </View>

                    <View
                      style={{
                        minWidth: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: '#ef4444',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 6,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>
                        {unreadBy[c.id]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
            {/* -------- FIN BANDEJA -------- */}
          </View>
        </ScrollView>
      );
    }

    // chat recepcionista
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMode('list');
              setSelected(null);
              setMsgs([]);
              loadUnread();
            }}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: '#e2e8f0',
            }}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', fontSize: 16 }}>Chat con {selected?.name}</Text>
        </View>

        <FlatList
          ref={listRef}
          style={{ flex: 1, padding: 12 }}
          data={msgs}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => {
            const mine = item.from_id === user?.id;
            return (
              <View
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  backgroundColor: mine ? '#d1fae5' : '#fff',
                  borderWidth: 1,
                  borderColor: mine ? '#a7f3d0' : '#e2e8f0',
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginVertical: 4,
                  maxWidth: '80%',
                }}
              >
                {!mine && (
                  <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                    {selected?.name || 'Cliente'}
                  </Text>
                )}
                <Text style={{ color: '#0f172a' }}>{item.text}</Text>
              </View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            padding: 8,
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TextInput
            placeholder="Escribí…"
            value={input}
            onChangeText={setInput}
            style={
              {
                flex: 1,
                borderWidth: 1,
                borderColor: '#cbd5e1',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: Platform.OS === 'web' ? 10 : 8,
                outlineStyle: 'none',
              } as any
            }
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim()}
            style={{
              backgroundColor: input.trim() ? '#16a34a' : '#86efac',
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ================= CLIENTE / VETERINARIO ================= */
  const [recp, setRecp] = useState<UserLite | null>(null);

  const loadReceptionists = async () => {
    setErr('');
    setLoading(true);
    try {
      let d = await fetchJSON(PRIMARY_GET_RECEPTION);
      if (d.__status === 404 || (!d?.items && !Array.isArray(d))) {
        d = await fetchJSON(FALLBACK_GET_RECEPTION);
      }
      const arr: UserLite[] = Array.isArray(d?.items) ? d.items : (Array.isArray(d) ? d : []);
      const first = arr[0] || null;
      setRecp(first);
      if (first) {
        setSelected(first);
        await loadThread(first.id);
        await authFetch(MARK_READ_WITH(first.id), { method: 'POST' });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('messages:read'));
        }
      } else {
        setSelected(null);
        setMsgs([]);
      }
    } catch (e: any) {
      setErr(e?.message || 'No se pudo obtener la recepción');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceptionists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (!recp) return;
    const id = setInterval(async () => {
      await loadThread(recp.id);
      await authFetch(MARK_READ_WITH(recp.id), { method: 'POST' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('messages:read'));
      }
    }, 6000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recp]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          backgroundColor: '#fff',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: '800', fontSize: 16 }}>
          {recp ? `Chat con ${recp.name}` : 'Mensajes'}
        </Text>
        <TouchableOpacity onPress={loadReceptionists} style={{ padding: 6 }}>
          <Text style={{ color: '#0f766e', fontWeight: '700' }}>Reintentar</Text>
        </TouchableOpacity>
      </View>

      {err ? <Text style={{ color: '#b91c1c', padding: 12 }}>{err}</Text> : null}

      {!recp && (
        <View style={{ padding: 12 }}>
          {loading ? (
            <Text style={{ color: '#64748b' }}>Cargando…</Text>
          ) : (
            <Text style={{ color: '#64748b' }}>
              No hay recepcionistas disponibles ahora. Podés igualmente mandar un
              mensaje y lo recibirá el rol de recepción.
            </Text>
          )}
        </View>
      )}

      <FlatList
        ref={listRef}
        style={{ flex: 1, padding: 12 }}
        data={msgs}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => {
          const mine = item.from_id === user?.id;
          return (
            <View
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                backgroundColor: mine ? '#d1fae5' : '#fff',
                borderWidth: 1,
                borderColor: mine ? '#a7f3d0' : '#e2e8f0',
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 10,
                marginVertical: 4,
                maxWidth: '80%',
              }}
            >
              {!mine && recp && (
                <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                  {recp.name}
                </Text>
              )}
              <Text style={{ color: '#0f172a' }}>{item.text}</Text>
            </View>
          );
        }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          padding: 8,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <TextInput
          placeholder="Escribí…"
          value={input}
          onChangeText={setInput}
          style={
            {
              flex: 1,
              borderWidth: 1,
              borderColor: '#cbd5e1',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: Platform.OS === 'web' ? 10 : 8,
              outlineStyle: 'none',
            } as any
          }
        />
        <TouchableOpacity
          onPress={send}
          disabled={!input.trim()}
          style={{
            backgroundColor: input.trim() ? '#16a34a' : '#86efac',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
