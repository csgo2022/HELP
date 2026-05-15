import request from './index'

export function getUsers(params) {
  return request.get('/admin/users', { params })
}

export function getUserDetail(id) {
  return request.get(`/admin/users/${id}`)
}

export function toggleUserStatus(id) {
  return request.put(`/admin/users/${id}/status`)
}

export function getRealnameAuths() {
  return request.get('/admin/realname-auth/list')
}

export function reviewRealnameAuth(id, data) {
  return request.put(`/admin/realname-auth/${id}`, data)
}
