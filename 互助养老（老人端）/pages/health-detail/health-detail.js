const api = require('../../utils/api');

Page({
  data: {
    record: null,
    analysis: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const records = await api.getHealthRecords();
      const record = (records || []).find(r => r.id === Number(id));
      if (record && record.analysisResult) {
        const analysis = JSON.parse(record.analysisResult);
        const date = record.createdAt
          ? record.createdAt.substring(0, 16).replace('T', ' ')
          : '';
        this.setData({ record: { ...record, date }, analysis, loading: false });
      } else {
        this.setData({ loading: false });
      }
    } catch (_) {
      this.setData({ loading: false });
    }
  },

  goBack() { wx.navigateBack(); },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.previewImage({ urls: [url] });
    }
  }
});
