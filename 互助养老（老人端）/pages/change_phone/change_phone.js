Page({
  data: {
    step: 1,
    phone: '138 1133 9527',
    newPhone: '',
    code: ''
  },

  goBack() {
    wx.navigateBack();
  },

  onPhoneInput(e) {
    if (this.data.step === 2) {
      this.setData({ newPhone: e.detail.value });
    }
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  getCode() {
    wx.showToast({ title: '验证码已发送', icon: 'none' });
  },

  handleNext() {
    if (this.data.step === 1) {
      this.setData({ step: 2 });
    } else {
      wx.showToast({ title: '换绑成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    }
  }
})
