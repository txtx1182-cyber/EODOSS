export const API_BASE =
  typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:8000'
    : '';

export const API = (path: string) => `${API_BASE}/api/${path.replace(/^\/?api\//, '')}`;

export const WS_URL = API_BASE
  ? API_BASE.replace(/^http/, 'ws') + '/ws/live'
  : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/live`;
