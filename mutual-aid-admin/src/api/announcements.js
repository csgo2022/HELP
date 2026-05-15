import request from './index'

export function getAnnouncements(params) {
  return request.get('/admin/announcements', { params })
}

export function createAnnouncement(data) {
  return request.post('/admin/announcements', data)
}

export function updateAnnouncement(id, data) {
  return request.put(`/admin/announcements/${id}`, data)
}

export function deleteAnnouncement(id) {
  return request.delete(`/admin/announcements/${id}`)
}
