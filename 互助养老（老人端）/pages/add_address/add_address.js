const api = require('../../utils/api');

Page({
  data: {
    name: '',
    detail: '',
    latitude: '',
    longitude: ''
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onDetailInput(e) { this.setData({ detail: e.detail.value }); },

  onChooseLocation() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => this.openLocationPicker(),
            fail: () => {
              wx.showModal({
                title: '需要位置权限',
                content: '请在设置中允许获取位置信息，以便在地图上选择地址',
                success: (modal) => {
                  if (modal.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          this.openLocationPicker();
        }
      }
    });
  },

  openLocationPicker() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          name: res.name || '',
          detail: res.address || '',
          latitude: res.latitude || '',
          longitude: res.longitude || ''
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '定位失败，请手动输入', icon: 'none' });
        }
      }
    });
  },

  async handleSave() {
    const { name, detail } = this.data;
    if (!name || !detail) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '保存中...' });
      await api.createAddress({ name, phone: '', address: detail, isDefault: false });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
