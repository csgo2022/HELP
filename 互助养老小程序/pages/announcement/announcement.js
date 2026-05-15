const api = require('../../utils/api');

Page({
  data: {
    announcements: []
  },

  async onLoad() {
    try {
      const list = await api.getAnnouncements();
      this.setData({ announcements: list });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
