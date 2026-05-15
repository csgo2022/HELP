import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/UserListView.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('../views/services/ServiceManageView.vue'),
        meta: { title: '服务管理', icon: 'List' }
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('../views/announcements/AnnouncementManageView.vue'),
        meta: { title: '公告管理', icon: 'ChatDotSquare' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/products/ProductManageView.vue'),
        meta: { title: '商品管理', icon: 'Goods' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/orders/OrderManageView.vue'),
        meta: { title: '订单管理', icon: 'Tickets' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/SettingsView.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
