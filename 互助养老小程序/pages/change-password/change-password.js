const api = require('../../utils/api');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    canSubmit: false
  },

  onOldInput(e) { this.setData({ oldPassword: e.detail.value }, this.checkForm); },
  onNewInput(e) { this.setData({ newPassword: e.detail.value }, this.checkForm); },
  onConfirmInput(e) { this.setData({ confirmPassword: e.detail.value }, this.checkForm); },

  checkForm() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    this.setData({
      canSubmit: oldPassword.length > 0 && newPassword.length >= 6 && newPassword === confirmPassword
    });
  },

  async onSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data;

    if (!oldPassword) {
      wx.showToast({ title: '请输入旧密码', icon: 'none' });
      return;
    }
    if (newPassword.length < 6) {
      wx.showToast({ title: '新密码至少6位', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      await api.changePassword(oldPassword, newPassword);
      wx.showToast({ title: '密码修改成功', icon: 'success' });
      this.setData({ oldPassword: '', newPassword: '', confirmPassword: '', canSubmit: false });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: e.message || '修改失败，请检查旧密码是否正确', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
