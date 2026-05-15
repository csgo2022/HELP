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
  },

  goBack() { wx.navigateBack(); },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/announcement_detail/announcement_detail?id=${id}` });
  }
});
