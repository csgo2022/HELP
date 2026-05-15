const api = require('../../utils/api');

Page({
  data: {
    loginType: 'phone',
    phoneNumber: '',
    code: '',
    account: '',
    password: '',
    agreed: true
  },

  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type });
  },

  onPhoneInput(e) { this.setData({ phoneNumber: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onAccountInput(e) { this.setData({ account: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },

  onAgreeChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  getCode() {
    wx.showToast({ title: '验证码已发送', icon: 'none' });
  },

  async handleLogin() {
    const { loginType, phoneNumber, account, password, agreed } = this.data;
    if (!agreed) {
      wx.showToast({ title: '请同意用户协议', icon: 'none' });
      return;
    }
    try {
      const phone = loginType === 'phone' ? phoneNumber : account;
      const pwd = loginType === 'phone' ? code : password;
      if (!phone || !pwd) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }
      wx.showLoading({ title: '登录中...' });
      const res = await api.login(phone, pwd);
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
