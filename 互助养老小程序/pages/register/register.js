const api = require('../../utils/api');

Page({
  data: {
    formData: { phone: '', password: '', confirmPassword: '' },
    error: ''
  },

  onFieldInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ ['formData.' + field]: value });
  },

  async handleRegister(e) {
    const { phone, password, confirmPassword } = this.data.formData;
    if (!phone || !password || !confirmPassword) {
      this.setData({ error: '请填写所有必填项' });
      return;
    }
    if (password !== confirmPassword) {
      this.setData({ error: '两次输入的密码不一致' });
      return;
    }
    try {
      wx.showLoading({ title: '注册中...' });
      const res = await api.register(phone, password, 'VOLUNTEER');
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.switchTab({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      this.setData({ error: e.message || '注册失败' });
    }
  },

  goLogin() {
    wx.redirectTo({ url: '/pages/login/login' });
  }
});
