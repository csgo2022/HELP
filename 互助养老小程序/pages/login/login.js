const api = require('../../utils/api');

Page({
  data: {
    phone: '',
    password: '',
    error: ''
  },

  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },

  async handleLogin(e) {
    const { phone, password } = this.data;
    if (!phone || !password) {
      this.setData({ error: '请输入手机号和密码' });
      return;
    }
    try {
      wx.showLoading({ title: '登录中...' });
      const res = await api.login(phone, password);
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.switchTab({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      this.setData({ error: e.message || '登录失败' });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  },

  onForgotPassword() {
    wx.navigateTo({ url: '/pages/forgot-password/forgot-password' });
  }
});
