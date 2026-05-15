Page({
  goBack() {
    wx.navigateBack();
  },

  goChangePassword() {
    wx.navigateTo({ url: '/pages/change_password/change_password' });
  },

  goChangePhone() {
    wx.navigateTo({ url: '/pages/change_phone/change_phone' });
  },

  onDeleteAccount() {
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
})
