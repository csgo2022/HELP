const api = require('../../utils/api');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  goBack() { wx.navigateBack(); },
  onOldInput(e) { this.setData({ oldPassword: e.detail.value }); },
  onNewInput(e) { this.setData({ newPassword: e.detail.value }); },
  onConfirmInput(e) { this.setData({ confirmPassword: e.detail.value }); },

  async handleChange() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    if (!oldPassword || !newPassword) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '修改中...' });
      await api.changePassword(oldPassword, newPassword);
      wx.hideLoading();
      wx.showToast({ title: '密码修改成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '修改失败', icon: 'none' });
    }
  }
});
