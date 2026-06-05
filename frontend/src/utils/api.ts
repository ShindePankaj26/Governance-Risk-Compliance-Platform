import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('grc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('grc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  register: (data: object) => api.post('/auth/register', data),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getAlerts:  () => api.get('/dashboard/alerts'),
}

// ─── Risks ────────────────────────────────────────────────────────────────────
export const risksApi = {
  list:      (params?: object) => api.get('/risks', { params }),
  get:       (id: number)      => api.get(`/risks/${id}`),
  create:    (data: object)    => api.post('/risks', data),
  update:    (id: number, data: object) => api.put(`/risks/${id}`, data),
  delete:    (id: number)      => api.delete(`/risks/${id}`),
  heatmap:   ()                => api.get('/risks/stats/heatmap'),
}

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const vendorsApi = {
  list:   (params?: object) => api.get('/vendors', { params }),
  create: (data: object)    => api.post('/vendors', data),
  update: (id: number, data: object) => api.put(`/vendors/${id}`, data),
  delete: (id: number)      => api.delete(`/vendors/${id}`),
}

// ─── Compliance ───────────────────────────────────────────────────────────────
export const complianceApi = {
  frameworks:       () => api.get('/compliance/frameworks'),
  getFramework:     (id: number) => api.get(`/compliance/frameworks/${id}`),
  getControls:      (fwId: number) => api.get(`/compliance/frameworks/${fwId}/controls`),
  updateControl:    (id: number, data: object) => api.put(`/compliance/controls/${id}`, data),
  overallScore:     () => api.get('/compliance/score'),
}

// ─── Audits ───────────────────────────────────────────────────────────────────
export const auditsApi = {
  list:         (params?: object) => api.get('/audits', { params }),
  get:          (id: number)      => api.get(`/audits/${id}`),
  create:       (data: object)    => api.post('/audits', data),
  updateProgress: (id: number, progress: number, status: string) =>
    api.put(`/audits/${id}/progress`, null, { params: { progress, status } }),
  addFinding:   (id: number, data: object) => api.post(`/audits/${id}/findings`, data),
  getFindings:  (id: number)      => api.get(`/audits/${id}/findings`),
}

// ─── Policies ─────────────────────────────────────────────────────────────────
export const policiesApi = {
  list:         (params?: object) => api.get('/policies', { params }),
  create:       (data: object)    => api.post('/policies', data),
  updateStatus: (id: number, status: string) =>
    api.put(`/policies/${id}/status`, null, { params: { status } }),
  delete:       (id: number)      => api.delete(`/policies/${id}`),
}

// ─── AI Governance ────────────────────────────────────────────────────────────
export const aigovApi = {
  list:           (params?: object) => api.get('/aigov', { params }),
  get:            (id: number)      => api.get(`/aigov/${id}`),
  register:       (data: object)    => api.post('/aigov', data),
  reportIncident: (id: number, desc: string) =>
    api.put(`/aigov/${id}/incident`, null, { params: { description: desc } }),
}
