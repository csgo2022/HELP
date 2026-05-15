import request from './index'

export function getProducts() {
  return request.get('/admin/products')
}

export function createProduct(data) {
  return request.post('/admin/products', data)
}

export function updateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/mini/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
