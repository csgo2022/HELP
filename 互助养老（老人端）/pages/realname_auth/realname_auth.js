const api = require('../../utils/api');

Page({
  data: {
    frontImage: '',
    backImage: '',
    realName: '',
    idCard: ''
  },

  uploadFront() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => { this.setData({ frontImage: res.tempFiles[0].tempFilePath }); }
    });
  },

  uploadBack() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => { this.setData({ backImage: res.tempFiles[0].tempFilePath }); }
    });
  },

  goBack() { wx.navigateBack(); },

  onNameInput(e) { this.setData({ realName: e.detail.value }); },
  onIdCardInput(e) { this.setData({ idCard: e.detail.value }); },

  async handleSubmit() {
    const { realName, idCard } = this.data;
    if (!realName || !idCard) {
      wx.showToast({ title: '请填写姓名和身份证号', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '提交中...' });
      await api.realnameAuth(realName, idCard);
      wx.hideLoading();
      wx.showToast({ title: '认证成功', icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: '/pages/home/home' }), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '认证失败', icon: 'none' });
    }
  }
});
