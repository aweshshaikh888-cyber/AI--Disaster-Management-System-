import {
  Incident, AIAnalysisResult, RescueTeam, HospitalShelter,
  EmergencyResource, ResourceRequest, EmergencyNotification,
  WeatherAlert, AuditLog, Drone, User
} from '../types';

export const API_BASE = 'http://127.0.0.1:8000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('disasterai_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<{ access_token: string; user: User }>(`/auth/login`, { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<{ access_token: string; user: User }>(`/auth/register`, { method: 'POST', body: JSON.stringify(data) }),
  demoLogin: (role: string) => request<{ access_token: string; user: User }>(`/auth/demo-login`, { method: 'POST', body: JSON.stringify({ role }) }),

  // Dashboard
  getDashboardSummary: () => request<any>(`/dashboard/summary`),

  // Incidents
  getIncidents: (params: { disaster_type?: string; severity?: string; status?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.disaster_type) q.append('disaster_type', params.disaster_type);
    if (params.severity) q.append('severity', params.severity);
    if (params.status) q.append('status', params.status);
    if (params.search) q.append('search', params.search);
    return request<Incident[]>(`/incidents?${q.toString()}`);
  },
  getIncident: (id: number) => request<{ incident: Incident; timeline: any[]; analyses: any[] }>(`/incidents/${id}`),
  createIncident: (data: any) => request<Incident>(`/incidents`, { method: 'POST', body: JSON.stringify(data) }),
  updateIncident: (id: number, data: any) => request<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteIncident: (id: number) => request<{ success: boolean }>(`/incidents/${id}`, { method: 'DELETE' }),
  addTimelineEvent: (id: number, data: any) => request<any>(`/incidents/${id}/timeline`, { method: 'POST', body: JSON.stringify(data) }),

  // AI
  analyzeImage: async (formData: FormData): Promise<AIAnalysisResult> => {
    return request<AIAnalysisResult>(`/ai/analyze-image`, {
      method: 'POST',
      body: formData,
    });
  },
  getModelMetrics: () => request<any>(`/ai/model-metrics`),
  getModelStatus: () => request<any>(`/ai/model-status`),
  getModels: () => request<any[]>(`/ai/models`),
  switchModel: (model_version: string) => request<any>(`/ai/switch-model?model_version=${encodeURIComponent(model_version)}`, { method: 'POST' }),

  // Drone
  getDrones: () => request<Drone[]>(`/drone/drones`),
  getDetections: () => request<any[]>(`/drone/detections`),
  uploadDroneVideo: (formData: FormData) => request<any>(`/drone/upload-video`, { method: 'POST', body: formData }),

  // Map
  getMapConfig: () => request<{ providers: any[]; active_keys: any }>(`/map/config`),
  updateMapConfig: (data: { google_maps_api_key?: string; mapbox_api_key?: string; maptiler_api_key?: string }) =>
    request<any>(`/map/config`, { method: 'POST', body: JSON.stringify(data) }),
  geocodeLocation: (query: string) =>
    request<Array<{ display_name: string; latitude: number; longitude: number; source: string }>>(
      `/map/geocode?query=${encodeURIComponent(query)}`
    ),
  reverseGeocode: (lat: number, lon: number) =>
    request<{ formatted_address: string; latitude: number; longitude: number; source: string }>(
      `/map/reverse-geocode?lat=${lat}&lon=${lon}`
    ),
  getMapLayers: () => request<{
    incidents: any[];
    rescue_teams: any[];
    facilities: any[];
    weather_alerts: any[];
  }>(`/map/layers`),

  // Priority
  calculatePriority: (data: any) => request<any>(`/priority/calculate`, { method: 'POST', body: JSON.stringify(data) }),
  getWeights: () => request<any>(`/priority/weights`),
  updateWeights: (data: any) => request<any>(`/priority/weights`, { method: 'POST', body: JSON.stringify(data) }),

  // Rescue
  getRescueTeams: () => request<RescueTeam[]>(`/rescue-teams`),
  createRescueTeam: (data: any) => request<RescueTeam>(`/rescue-teams`, { method: 'POST', body: JSON.stringify(data) }),
  assignTeam: (data: any) => request<any>(`/rescue-teams/assign`, { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: number, data: any) => request<RescueTeam>(`/rescue-teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request<EmergencyNotification[]>(`/notifications`),
  broadcastNotification: (data: any) => request<EmergencyNotification>(`/notifications`, { method: 'POST', body: JSON.stringify(data) }),
  acknowledgeNotification: (id: number) => request<any>(`/notifications/${id}/acknowledge`, { method: 'POST' }),

  // Weather
  getWeather: () => request<any>(`/weather/current`),

  // Resources
  getResources: () => request<EmergencyResource[]>(`/resources`),
  updateResource: (id: number, data: any) => request<EmergencyResource>(`/resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getResourceRequests: () => request<ResourceRequest[]>(`/resources/requests`),
  createResourceRequest: (data: any) => request<any>(`/resources/requests`, { method: 'POST', body: JSON.stringify(data) }),
  approveResourceRequest: (id: number) => request<any>(`/resources/requests/${id}/approve`, { method: 'POST' }),

  // Facilities
  getFacilities: (facility_type?: string, lat?: number, lon?: number) => {
    const q = new URLSearchParams();
    if (facility_type) q.append('facility_type', facility_type);
    if (lat !== undefined && lon !== undefined) {
      q.append('lat', lat.toString());
      q.append('lon', lon.toString());
    }
    return request<HospitalShelter[]>(`/facilities?${q.toString()}`);
  },

  // Reports
  getAnalyticsSummary: () => request<any>(`/reports/summary`),
  getCsvExportUrl: () => `${API_BASE}/reports/export/csv`,

  // Copilot
  queryCopilot: (query: string, incident_id?: number, task_type?: string) =>
    request<{ response: string; source: string }>(`/copilot/query`, {
      method: 'POST',
      body: JSON.stringify({ query, incident_id, task_type }),
    }),

  // Admin
  getSystemHealth: () => request<any>(`/admin/system-health`),
  getAuditLogs: (limit = 50) => request<AuditLog[]>(`/admin/audit-logs?limit=${limit}`),
  getUsers: () => request<User[]>(`/admin/users`),
  updateUserRole: (userId: number, role: string) => request<any>(`/admin/users/${userId}/role?new_role=${role}`, { method: 'PATCH' }),
};
