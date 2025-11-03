import { Platform } from 'react-native';

const MANUAL_BASE = ''; // ej: 'http://192.168.1.52:4000'

function resolveBase() {
  if (MANUAL_BASE) return MANUAL_BASE;

  // Web (navegador en tu PC): backend local
  if (Platform.OS === 'web') return 'http://localhost:4000';

  // Android Emulator necesita 10.0.2.2 para llegar al host
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000';

  // iOS Simulator llega por localhost
  if (Platform.OS === 'ios') return 'http://localhost:4000';

  // Fallback
  return 'http://localhost:4000';
}

export const API_BASE = resolveBase();
