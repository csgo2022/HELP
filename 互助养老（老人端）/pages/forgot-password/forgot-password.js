const api = require('../../utils/api');

Page({
  data: {
    phone: '',
    newPassword: '',
    confirmPassword: '',
    canSubmit: false
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
    this.checkForm();
  },

  onPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
    this.checkForm();
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
    this.checkForm();
  },

  checkForm() {
    const { phone, newPassword, confirmPassword } = this.data;
    this.setData({
      canSubmit: phone.length === 11 && newPassword.length >= 6 && newPassword === confirmPassword
    });
  },

  async onSubmit() {
    const { phone, newPassword, confirmPassword } = this.data;
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      await api.resetPassword(phone, newPassword);
      wx.showToast({ title: '重置成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: e.message || '重置失败', icon: 'none' });
    }
  }
});
