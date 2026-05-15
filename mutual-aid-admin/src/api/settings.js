import request from './index'

export function getSettings() {
  return request.get('/admin/settings')
}

export function updateSettings(data) {
  return request.put('/admin/settings', data)
}
