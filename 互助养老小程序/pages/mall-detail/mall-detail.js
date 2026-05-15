const api = require('../../utils/api');

Page({
  data: {
    item: { title: '', points: 0, description: '' },
    quantity: 1,
    totalPoints: 0,
    availablePoints: 0,
    availablePointsFormatted: '0',
    totalPointsFormatted: '0',
    selectedAddress: null
  },

  async onLoad(options) {
    const item = {
      id: options.id || '',
      title: decodeURIComponent(options.title || ''),
      points: parseInt(options.points) || 0,
      description: decodeURIComponent(options.description || ''),
      image: decodeURIComponent(options.image || '')
    };
    this.setData({ item }, () => this.updateQuantity());

    try {
      const balance = await api.getPointsBalance();
      this.setData({ availablePoints: balance || 0 });
    } catch (e) {
      console.error(e);
    }
  },

  updateQuantity() {
    const qty = this.data.quantity;
    const pts = this.data.item.points;
    this.setData({
      totalPoints: qty * pts,
      totalPointsFormatted: (qty * pts).toLocaleString(),
      availablePointsFormatted: this.data.availablePoints.toLocaleString()
    });
  },

  onMinus() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
      this.updateQuantity();
    }
  },

  onPlus() {
    const maxQty = Math.floor(this.data.availablePoints / this.data.item.points);
    if (this.data.quantity < maxQty) {
      this.setData({ quantity: this.data.quantity + 1 });
      this.updateQuantity();
    }
  },

  onAddressTap() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  onCancel() {
    wx.navigateBack();
  },

  async onConfirm() {
    const { item, quantity, selectedAddress } = this.data;
    if (!selectedAddress) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '兑换中...' });
      await api.createOrder({
        productId: item.id,
        quantity,
        recipientName: selectedAddress.name,
        recipientPhone: selectedAddress.phone,
        address: selectedAddress.address
      });
      wx.hideLoading();
      wx.showToast({ title: '兑换成功', icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: '/pages/orders/orders' }), 1500);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '兑换失败', icon: 'none' });
    }
  }
});
