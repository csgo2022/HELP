const api = require('../../utils/api');

Page({
  data: {
    userName: '用户',
    avatar: '',
    days: 0,
    points: 0
  },

  async onShow() {
    await this.loadProfile();
  },

  async loadProfile() {
    try {
      const profile = await api.getProfile();
      this.setData({
        userName: profile.name || '用户',
        avatar: profile.avatar || '',
        points: profile.points || 0
      });
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
  },

  goHome() {
    wx.navigateTo({ url: '/pages/home/home' });
  },

  goRequest() {
    wx.navigateTo({ url: '/pages/request/request' });
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goProfileSettings() {
    wx.navigateTo({ url: '/pages/profile_settings/profile_settings' });
  },

  goAddressBook() {
    wx.navigateTo({ url: '/pages/address_book/address_book' });
  },

  goBindFamily() {
    wx.navigateTo({ url: '/pages/bind_family/bind_family' });
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
})
