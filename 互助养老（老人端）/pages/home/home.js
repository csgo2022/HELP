const api = require('../../utils/api');

Page({
  data: {
    greeting: '你好',
    userName: '用户',
    announcementTitle: '社区公告',
    announcementContent: ''
  },

  async onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    await this.loadData();
  },

  async loadData() {
    try {
      // 加载用户信息
      const profile = await api.getProfile();
      const hour = new Date().getHours();
      let timeWord = '你好';
      if (hour < 12) timeWord = '早上好';
      else if (hour < 18) timeWord = '下午好';
      else timeWord = '晚上好';

      this.setData({
        greeting: timeWord,
        userName: profile.name || '用户'
      });
    } catch (e) {
      console.error('加载首页数据失败', e);
    }

    try {
      // 加载最新公告
      const list = await api.getAnnouncements();
      if (list && list.length > 0) {
        this.setData({
          announcementContent: list[0].content || list[0].title || ''
        });
      }
    } catch (e) {
      console.error('加载公告失败', e);
    }
  },

  goHome() {
    // already on home
  },

  goHealth() {
    wx.navigateTo({ url: '/pages/health/health' });
  },

  goRequest() {
    wx.navigateTo({ url: '/pages/request/request' });
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/records/records' });
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  goAnnouncements() {
    wx.navigateTo({ url: '/pages/announcements/announcements' });
  }
})
