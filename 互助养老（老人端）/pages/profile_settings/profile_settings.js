const api = require('../../utils/api');

Page({
  data: {
    userName: '用户',
    realName: '',
    phone: '',
    avatar: ''
  },

  async onShow() {
    await this.loadProfile();
  },

  async loadProfile() {
    try {
      const profile = await api.getProfile();
      this.setData({
        userName: profile.name || '用户',
        realName: profile.name || '',
        phone: profile.phone || '',
        avatar: profile.avatar || ''
      });
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  goAccountSecurity() {
    wx.navigateTo({ url: '/pages/account_security/account_security' });
  },

  goEditProfile() {
    wx.navigateTo({ url: '/pages/edit_profile/edit_profile' });
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
  },

  onChangeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = res.tempFilePaths[0];
        wx.showLoading({ title: '上传中...', mask: true });
        try {
          const url = await api.uploadFile(filePath);
          await api.updateProfile({ avatar: url });
          this.setData({ avatar: url });
          wx.hideLoading();
          wx.showToast({ title: '头像已更新', icon: 'success' });
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: e.message || '上传失败', icon: 'none' });
        }
      }
    });
  }
});
