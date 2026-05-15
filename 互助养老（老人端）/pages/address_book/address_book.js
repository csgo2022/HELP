const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    addressList: [],
    selectMode: false
  },

  onLoad(options) {
    if (options.selectMode === 'true') {
      this.setData({ selectMode: true });
    }
  },

  async onShow() {
    try {
      const list = await api.getAddresses();
      this.setData({ addressList: list || [] });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },

  goAddAddress() {
    wx.navigateTo({ url: '/pages/add_address/add_address' });
  },

  onSelectAddress(e) {
    if (!this.data.selectMode) return;
    const item = e.currentTarget.dataset.item;
    const addressText = item.address || item.name || '';
    app.globalData.selectedAddress = addressText;
    wx.navigateBack();
  },

  onDeleteAddress(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除地址',
      content: `确定要删除「${name || '该地址'}」吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            await api.deleteAddress(id);
            wx.hideLoading();
            const list = await api.getAddresses();
            this.setData({ addressList: list || [] });
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: e.message || '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
});
