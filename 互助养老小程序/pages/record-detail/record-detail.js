const api = require('../../utils/api');

Page({
  data: {
    detail: null,
    infoList: []
  },

  async onLoad(options) {
    if (!options.id) return;
    try {
      const record = await api.getRecord(options.id);
      this.setData({ detail: record });
      this.setData({
        infoList: [
          { label: '服务时长', value: record.duration || '', icon: 'time' },
          { label: '服务日期', value: record.time || '', icon: 'date' },
          { label: '服务地点', value: record.location || '', icon: 'location' },
          { label: '服务对象', value: record.client || '', icon: 'user' },
          { label: '服务摘要', value: record.summary || '', icon: 'info' }
        ]
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  onCert() {
    wx.showToast({ title: '服务证明生成中', icon: 'none' });
  }
});
