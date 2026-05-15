const api = require('../../utils/api');

Page({
  data: {
    account: '',
    password: '',
    agreed: true
  },

  onAccountInput(e) { this.setData({ account: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },

  onAgreeChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  async handleLogin() {
    const { account, password, agreed } = this.data;
    if (!agreed) {
      wx.showToast({ title: '请同意用户协议', icon: 'none' });
      return;
    }
    if (!account || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '登录中...' });
      const res = await api.login(account, password);
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.reLaunch({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  onForgotPassword() {
    wx.navigateTo({ url: '/pages/forgot-password/forgot-password' });
  }
});
