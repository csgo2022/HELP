const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userName: '志愿者',
    totalHours: '0',
    level: 'LV.1',
    motto: '用心服务，成就他人',
    rank: '',
    avatar: '',
    serviceCount: 0
  },

  async onShow() {
    await this.loadProfile();
  },

  resolveAvatar(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = app.globalData.apiBaseUrl.replace('/api/mini', '');
    return base + path;
  },

  async loadProfile() {
    try {
      const profile = await api.getProfile();
      this.setData({
        userName: profile.name || '志愿者',
        totalHours: profile.totalHours ? profile.totalHours + 'h' : '0h',
        level: profile.isGold ? 'LV.5' : 'LV.1',
        avatar: profile.avatar ? this.resolveAvatar(profile.avatar) : '',
        serviceCount: profile.serviceCount || 0
      });
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          wx.redirectTo({ url: '/pages/login/login' });
        }
      }
    });
  },

  async onDeleteAccount() {
    const api = require('../../utils/api');
    wx.showModal({
      title: '确认注销',
      content: '注销后将无法找回您的任何数据，请谨慎操作',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteAccount();
            wx.removeStorageSync('token');
            wx.removeStorageSync('user');
            wx.showToast({ title: '账号已注销', icon: 'success' });
            setTimeout(() => wx.redirectTo({ url: '/pages/login/login' }), 1500);
          } catch (e) {
            wx.showToast({ title: e.message || '注销失败', icon: 'none' });
          }
        }
      }
    });
  },
});
