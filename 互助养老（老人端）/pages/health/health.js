const api = require('../../utils/api');

Page({
  data: {
    records: [],
    historyList: [],
    analysis: null,
    loading: false,
    hasResult: false
  },

  async onShow() {
    this.data.selectedId = null;
    await this.loadRecords();
  },

  async loadRecords() {
    try {
      const records = await api.getHealthRecords();
      this.setData({ records: records || [] });

      // 构建历史记录列表
      const historyList = (records || []).map(r => {
        let riskLevel = 'normal';
        let summary = '';
        if (r.analysisResult) {
          try {
            const parsed = JSON.parse(r.analysisResult);
            riskLevel = parsed.riskLevel || 'normal';
            summary = parsed.summary || '';
          } catch (_) {}
        }
        const date = r.createdAt
          ? r.createdAt.substring(0, 16).replace('T', ' ')
          : '';
        return {
          id: r.id,
          date,
          riskLevel,
          summary: summary.substring(0, 40) + (summary.length > 40 ? '...' : '')
        };
      });

      this.setData({ historyList });

      // 显示最新（或当前选中）记录的分析结果
      if (records && records.length > 0) {
        const targetId = this.data.selectedId || records[0].id;
        const target = records.find(r => r.id === targetId) || records[0];
        if (target.analysisResult) {
          try {
            const analysis = JSON.parse(target.analysisResult);
            this.setData({ analysis, hasResult: true, selectedId: target.id });
          } catch (_) {
            this.setData({ hasResult: false });
          }
        } else {
          this.setData({ hasResult: false });
        }
      } else {
        this.setData({ hasResult: false });
      }
    } catch (_) {}
  },

  onSelectRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/health-detail/health-detail?id=${id}` });
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
          this.setData({ analysis, hasResult: true, selectedId: null });
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
