const api = require('../../utils/api');

Page({
  data: {
    name: '',
    phone: '',
    familyList: []
  },

  async onShow() {
    await this.loadFamily();
  },

  async loadFamily() {
    try {
      const list = await api.getFamilyBindings();
      this.setData({ familyList: list || [] });
    } catch (e) {
      console.error('加载家属列表失败', e);
    }
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },

  async handleBind() {
    const { name, phone } = this.data;
    if (!name || !phone) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '绑定中...' });
      await api.createFamilyBinding(name, phone);
      wx.hideLoading();
      wx.showToast({ title: '绑定成功', icon: 'success' });
      this.setData({ name: '', phone: '' });
      await this.loadFamily();
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '绑定失败', icon: 'none' });
    }
  }
});
