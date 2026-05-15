const api = require('../../utils/api');

Page({
  data: {
    phoneNumber: '',
    code: '',
    password: '',
    confirmPassword: ''
  },

  onPhoneInput(e) { this.setData({ phoneNumber: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onConfirmPasswordInput(e) { this.setData({ confirmPassword: e.detail.value }); },

  getCode() {
    wx.showToast({ title: '验证码已发送', icon: 'none' });
  },

  async handleRegister() {
    const { phoneNumber, password, confirmPassword } = this.data;
    if (!phoneNumber || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '注册中...' });
      const res = await api.register(phoneNumber, password, 'ELDERLY');
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.reLaunch({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '注册失败', icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); }
});
