const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    formData: { name: '', gender: '', birthDate: '', phone: '', avatar: '' }
  },

  async onLoad() {
    try {
      const profile = await api.getProfile();
      this.setData({
        formData: {
          name: profile.name || '',
          gender: profile.gender === 1 ? '男' : profile.gender === 2 ? '女' : '',
          birthDate: profile.birthDate || '',
          phone: profile.phone || '',
          avatar: profile.avatar ? this.resolveAvatar(profile.avatar) : ''
        }
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  resolveAvatar(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = app.globalData.apiBaseUrl.replace('/api/mini', '');
    return base + path;
  },

  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0];
        this.uploadAvatar(tempPath);
      }
    });
  },

  async uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' });
    try {
      const url = await api.uploadAvatar(filePath);
      this.setData({ 'formData.avatar': this.resolveAvatar(url) });
      wx.hideLoading();
      wx.showToast({ title: '头像已更新', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '上传失败', icon: 'none' });
    }
  },

  onGenderTap(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ 'formData.gender': gender });
  },

  onDateChange(e) {
    this.setData({ 'formData.birthDate': e.detail.value });
  },

  async onSubmit(e) {
    const formVal = e.detail.value;
    const { name, phone } = formVal;
    const { gender, birthDate, avatar } = this.data.formData;
    try {
      wx.showLoading({ title: '保存中...' });
      await api.updateProfile({ name, gender: gender === '男' ? 1 : gender === '女' ? 2 : 0, birthDate, phone, avatar });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
