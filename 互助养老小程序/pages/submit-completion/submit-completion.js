const api = require('../../utils/api');

Page({
  data: {
    taskId: '',
    photos: [],
    tempFiles: [],
    summary: '',
    submitting: false
  },

  onLoad(options) {
    this.setData({ taskId: options.id || '' });
  },

  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = [...this.data.tempFiles, ...res.tempFilePaths];
        this.setData({ tempFiles, photos: tempFiles });
      }
    });
  },

  removePhoto(e) {
    const index = e.currentTarget.dataset.index;
    const tempFiles = [...this.data.tempFiles];
    tempFiles.splice(index, 1);
    this.setData({ tempFiles, photos: tempFiles });
  },

  onSummaryInput(e) {
    this.setData({ summary: e.detail.value });
  },

  async submitCompletion() {
    const { taskId, tempFiles, summary } = this.data;
    if (tempFiles.length === 0) {
      wx.showToast({ title: '请至少上传一张照片', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '上传照片中...', mask: true });

    try {
      // 1. Upload each photo to OSS, get URLs
      const photoUrls = [];
      for (const filePath of tempFiles) {
        const url = await api.uploadTempFile(filePath);
        photoUrls.push(url);
      }

      wx.showLoading({ title: '提交中...', mask: true });

      // 2. Submit completion with all photo URLs + summary
      await api.submitCompletion(taskId, {
        photoUrls,
        summary: summary || ''
      });

      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.hideLoading();
      this.setData({ submitting: false });
      wx.showToast({ title: e.message || '提交失败', icon: 'none' });
    }
  }
});
