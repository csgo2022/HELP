const api = require('../../utils/api');

Page({
  data: {
    name: '',
    phone: ''
  },

  async onLoad() {
    try {
      const profile = await api.getProfile();
      this.setData({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },

  async handleSave() {
    const { name, phone } = this.data;
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '保存中...' });
      await api.updateProfile({ name, phone });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
