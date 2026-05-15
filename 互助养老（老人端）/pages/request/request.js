const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    step: 1,
    selectedType: '',
    remark: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '',
    today: ''
  },

  onLoad() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.setData({ today: `${y}-${m}-${d}` });
  },

  onShow() {
    if (app.globalData.selectedAddress) {
      this.setData({ address: app.globalData.selectedAddress });
      app.globalData.selectedAddress = '';
    }
  },

  goBack() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 });
    } else {
      wx.navigateBack();
    }
  },

  selectService(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
    this.nextStep();
  },

  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },
  onDateChange(e) { this.setData({ appointmentDate: e.detail.value }); },
  onTimeChange(e) { this.setData({ appointmentTime: e.detail.value }); },
  onDurationInput(e) { this.setData({ duration: e.detail.value }); },

  onAddressPicker() {
    wx.navigateTo({ url: '/pages/address_book/address_book?selectMode=true' });
  },

  async nextStep() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
      return;
    }
    const { selectedType, remark, address, appointmentDate, appointmentTime, duration } = this.data;
    try {
      wx.showLoading({ title: '发布中...' });
      await api.createTask({
        type: selectedType,
        title: selectedType,
        description: remark,
        address,
        appointmentDate,
        appointmentTime,
        duration,
        rewardHours: parseFloat(duration) || 0,
        remarks: remark
      });
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: '/pages/records/records' }), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '发布失败', icon: 'none' });
    }
  },

  prevStep() { this.setData({ step: this.data.step - 1 }); }
});
