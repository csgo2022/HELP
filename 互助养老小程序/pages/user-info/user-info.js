const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    userInfo: {
      name: '',
      gender: '',
      birthDate: '',
      phone: '',
      tags: [],
      avatar: ''
    }
  },

  async onShow() {
    try {
      const profile = await api.getProfile();
      this.setData({
        userInfo: {
          name: profile.name || '',
          gender: profile.gender === 1 ? '男' : profile.gender === 2 ? '女' : '未设置',
          birthDate: profile.birthDate || '',
          phone: profile.phone || '',
          tags: profile.tags || [],
          avatar: profile.avatar ? this.resolveAvatar(profile.avatar) : ''
        }
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  resolveAvatar(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = app.globalData.apiBaseUrl.replace('/api/mini', '');
    return base + path;
  },

  onEditProfile() {
    wx.navigateTo({ url: '/pages/edit-profile/edit-profile' });
  }
});
