const api = require('../../utils/api');

Page({
  data: {
    detail: null
  },

  async onLoad(options) {
    if (!options.id) return;
    try {
      const item = await api.getAnnouncement(options.id);
      this.setData({ detail: item });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
