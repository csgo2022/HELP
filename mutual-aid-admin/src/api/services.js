import request from './index'

export function getServiceTypes() {
  return request.get('/admin/service-types')
}

export function createServiceType(data) {
  return request.post('/admin/service-types', data)
}

export function updateServiceType(id, data) {
  return request.put(`/admin/service-types/${id}`, data)
}

export function deleteServiceType(id) {
  return request.delete(`/admin/service-types/${id}`)
}

export function getSkills() {
  return request.get('/admin/skills')
}

export function createSkill(data) {
  return request.post('/admin/skills', data)
}

export function updateSkill(id, data) {
  return request.put(`/admin/skills/${id}`, data)
}

export function deleteSkill(id) {
  return request.delete(`/admin/skills/${id}`)
}
