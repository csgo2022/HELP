const api = require('../../utils/api');

Page({
  data: {
    records: [],
    analysis: null,
    loading: false,
    hasResult: false
  },

  async onShow() {
    await this.loadRecords();
  },

  async loadRecords() {
    try {
      const records = await api.getHealthRecords();
      this.setData({ records: records || [] });
      // 显示最新的分析结果
      if (records && records.length > 0 && records[0].analysisResult) {
        try {
          const analysis = JSON.parse(records[0].analysisResult);
          this.setData({ analysis, hasResult: true });
        } catch (_) {
          this.setData({ hasResult: false });
        }
      } else {
        this.setData({ hasResult: false });
      }
    } catch (_) {}
  },

  goBack() { wx.navigateBack(); },

  handleUpload() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        try {
          wx.showLoading({ title: 'AI 分析中...', mask: true });
          const analysis = await api.analyzeHealthRecord(tempPath);
          wx.hideLoading();
          this.setData({ analysis, hasResult: true });
          wx.showToast({ title: '分析完成', icon: 'success' });
          await this.loadRecords();
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: e.message || '分析失败', icon: 'none' });
        }
      }
    });
  }
});
