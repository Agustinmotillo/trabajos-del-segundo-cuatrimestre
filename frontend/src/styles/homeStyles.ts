import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6faf9", // mint muy claro
  },

  // Fondo con patrón sutil (solo web)
  bgPattern: {
    ...StyleSheet.absoluteFillObject, // reemplaza "inset: 0 as any"
    // @ts-ignore
    backgroundImage:
      "radial-gradient(16px 16px at 16px 16px, rgba(66, 186, 150, .08) 1px, transparent 1px)",
    // @ts-ignore
    backgroundSize: "40px 40px",
    opacity: 0.6,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  breadcrumb: {
    color: "#6b7280",
    fontSize: 13,
  },

  hero: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  hello: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  helloSubtitle: {
    marginTop: 6,
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
  },

  // Grid responsive (1/2/3 columnas)
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    // layout flexible
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
    justifyContent: "center",
  },

  card: {
    width: 360,
    maxWidth: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    // @ts-ignore – web
    transition: "transform .18s ease, box-shadow .18s ease",
    // @ts-ignore
    boxShadow: "0 6px 18px rgba(15, 23, 42, .08)",
  },

  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9fbf5",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#c7f3e6",
  },
  cardIcon: { fontSize: 22 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  cardSubtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14,
  },

  newsCard: {
    // pequeño degradé sutil para diferenciar
    // @ts-ignore
    backgroundImage:
      "linear-gradient(180deg, rgba(231, 255, 247, .65), rgba(255,255,255,.9))",
  },
  newsItem: {
    color: "#334155",
    fontSize: 14,
  },

  cta: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  ctaText: {
    backgroundColor: "#e9fbf5",
    borderColor: "#bdf0e0",
    borderWidth: 1,
    color: "#115e59",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 800,
  },
});
