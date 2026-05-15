import request from './index'

export function login(data) {
  return request.post('/admin/login', data)
}
