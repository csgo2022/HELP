import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')

  async function login(username, password) {
    const res = await loginApi({ phone: username, password })
    token.value = res.data.accessToken
    localStorage.setItem('admin_token', res.data.accessToken)
    return res
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('admin_token')
  }

  function isLoggedIn() {
    return !!token.value
  }

  return { token, login, logout, isLoggedIn }
})
