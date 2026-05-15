const api = require('../../utils/api');

const ICON_MAP = {
  '在途': 'shipping',
  '已揽收': 'package',
  '已发货': 'package',
  '派送中': 'delivery',
  '已签收': 'check-circle',
  '已退签': 'checklist',
  '已退回': 'checklist',
  '疑难': 'info'
};

Page({
  data: {
    logisticsData: null,
    loading: true,
    error: null
  },

  async onLoad(options) {
    const orderId = options.id;
    if (!orderId) {
      this.setData({ loading: false, error: '缺少订单ID' });
      return;
    }
    try {
      wx.showLoading({ title: '加载中...' });
      const resp = await api.getLogistics(orderId);

      const events = (resp.events || []).map((e, i) => ({
        time: e.time || '',
        status: e.status || '',
        description: e.description || '',
        icon: ICON_MAP[e.status] || 'package',
        isLatest: i === 0
      }));

      this.setData({
        logisticsData: {
          orderId: resp.orderId,
          courier: resp.courier || '',
          courierId: resp.trackingNo || '',
          status: resp.status || '',
          address: resp.address || '',
          trailUrl: resp.trailUrl || '',
          routeFrom: resp.routeFrom || '',
          routeCur: resp.routeCur || '',
          routeTo: resp.routeTo || '',
          events
        },
        loading: false
      });
      wx.hideLoading();
    } catch (e) {
      wx.hideLoading();
      this.setData({
        loading: false,
        error: e.message || '加载失败'
      });
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  },

  openTrailUrl() {
    const url = this.data.logisticsData.trailUrl;
    if (url) {
      wx.navigateTo({
        url: '/pages/webview/webview?url=' + encodeURIComponent(url),
        fail: () => {
          wx.setClipboardData({
            data: url,
            success: () => wx.showToast({ title: '链接已复制，请在浏览器中打开', icon: 'none' })
          });
        }
      });
    }
  }
});
