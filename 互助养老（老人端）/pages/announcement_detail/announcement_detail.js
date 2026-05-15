const api = require('../../utils/api');

Page({
  data: {
    title: '',
    date: '',
    tag: '',
    content: ''
  },

  async onLoad(options) {
    if (!options.id) return;
    try {
      const item = await api.getAnnouncement(options.id);
      this.setData({
        title: item.title,
        date: item.date || '',
        tag: item.category || '',
        content: item.content || ''
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); }
});
