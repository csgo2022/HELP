const api = require('../../utils/api');

Page({
  data: {
    addresses: [],
    selectMode: false
  },

  async onShow() {
    this.setData({ selectMode: this.getSelectMode() });
    try {
      const list = await api.getAddresses();
      this.setData({ addresses: (list || []).map(a => ({
        id: a.id,
        name: a.name || '',
        phone: a.phone || '',
        address: a.address || '',
        default: a.isDefault || false
      })) });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  getSelectMode() {
    const pages = getCurrentPages();
    if (pages.length < 2) return false;
    const prevPage = pages[pages.length - 2];
    return prevPage && prevPage.route && prevPage.route.indexOf('mall-detail') !== -1;
  },

  onSelectAddress(e) {
    const { id, name, phone, address } = e.currentTarget.dataset;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedAddress: { id, name, phone, address }
      });
    }
    wx.navigateBack();
  },

  onDeleteAddress(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除地址',
      content: '确定要删除「' + (name || '该地址') + '」吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' });
            await api.deleteAddress(id);
            wx.hideLoading();
            const list = await api.getAddresses();
            this.setData({ addresses: (list || []).map(a => ({
              id: a.id,
              name: a.name || '',
              phone: a.phone || '',
              address: a.address || '',
              default: a.isDefault || false
            })) });
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
