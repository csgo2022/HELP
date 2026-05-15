import request from './index'

export function getOrders() {
  return request.get('/admin/orders')
}

export function getOrderDetail(id) {
  return request.get(`/admin/orders/${id}`)
}

export function updateLogistics(id, data) {
  return request.put(`/admin/orders/${id}/logistics`, data)
}
