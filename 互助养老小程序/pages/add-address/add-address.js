const api = require('../../utils/api');

Page({
  data: {
    recipientName: '',
    recipientPhone: '',
    addressName: '',
    addressDetail: '',
    latitude: '',
    longitude: ''
  },

  onRecipientNameInput(e) { this.setData({ recipientName: e.detail.value }); },
  onRecipientPhoneInput(e) { this.setData({ recipientPhone: e.detail.value }); },
  onNameInput(e) { this.setData({ addressName: e.detail.value }); },
  onDetailInput(e) { this.setData({ addressDetail: e.detail.value }); },

  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          addressName: res.name || '',
          addressDetail: res.address || '',
          latitude: res.latitude || '',
          longitude: res.longitude || ''
        });
      }
    });
  },

  async handleSave() {
    const { recipientName, recipientPhone, addressName, addressDetail } = this.data;
    if (!recipientName || !recipientPhone || !addressName || !addressDetail) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '保存中...' });
      await api.createAddress({ name: recipientName, phone: recipientPhone, address: addressDetail, isDefault: false });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
