const api = require('../../utils/api');

Page({
  data: {
    categories: ['全部商品', '积分兑换时长', '食品粮油', '居家生活', '健康防护'],
    activeCategory: 0,
    exchangeOptions: [],
    products: [],
    points: 0
  },

  async onLoad() {
    await this.loadData();
  },

  async loadData() {
    try {
      const [products, balance, rateRes] = await Promise.all([
        api.getProducts(),
        api.getPointsBalance(),
        api.getExchangeRate()
      ]);
      const rate = rateRes.pointsPerHour || 10;
      const options = [];
      [10, 20, 50].forEach(hours => {
        options.push({
          id: hours,
          title: `${hours} 小时服务时长`,
          desc: `兑换为 ${hours * rate} 积分，可在商城使用`,
          points: hours * rate
        });
      });
      this.setData({
        products: (products || []).map(p => ({
          id: p.id,
          name: p.name || '',
          points: p.pointsRequired || 0,
          badge: p.badge || '',
          image: p.image || '',
          description: p.description || ''
        })),
        exchangeOptions: options,
        points: balance || 0
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeCategory: index });
  },

  onPointsDetail() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  onGetMore() {
    wx.showToast({ title: '前往获取积分', icon: 'none' });
  },

  onExchange(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/mall-detail/mall-detail?id=${item.id}&title=${encodeURIComponent(item.name)}&points=${item.points}&description=${encodeURIComponent(item.description || '')}&image=${encodeURIComponent(item.image || '')}`
    });
  },

  onProductExchange(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/mall-detail/mall-detail?id=${item.id}&title=${encodeURIComponent(item.name)}&points=${item.points}&description=${encodeURIComponent(item.description || '品牌直供，品质保障')}&image=${encodeURIComponent(item.image || '')}`
    });
  }
});
