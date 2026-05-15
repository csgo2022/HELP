const api = require('../../utils/api');

const STATUS_MAP = {
  'PENDING': '待发货',
  'SHIPPED': '已发货',
  'DELIVERED': '已签收',
  'CANCELLED': '已取消'
};

Page({
  data: {
    orders: []
  },

  async onShow() {
    try {
      const list = await api.getOrders();
      this.setData({ orders: (list || []).map(o => ({
        id: o.id,
        orderNo: o.orderNo || '',
        productName: o.productName || '商品',
        productImage: o.productImage || '',
        quantity: o.quantity || 1,
        totalPoints: o.totalPoints || 0,
        status: o.status || '',
        statusText: STATUS_MAP[o.status] || o.status || '',
        createdAt: o.createdAt || '',
        courier: o.courier || '',
        trackingNo: o.trackingNo || ''
      })) });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goToLogistics(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/logistics/logistics?id=${id}` });
  }
});
