const api = require('../../utils/api');

const TYPE_ICON_MAP = {
  '助餐服务': 'restaurant',
  '医疗陪护': 'medical',
  '家政清洁': 'cleaning',
  '代买代办': 'shopping-basket',
  '心理慰藉': 'campaign',
  '心理疏导': 'psychology',
  '家居清洁': 'cleaning',
  '康复辅助': 'health',
  '就医陪诊': 'medical',
  '轮椅辅助': 'smart-toy'
};

const STATUS_MAP = {
  'PENDING': '待审核',
  'MATCHING': '匹配中',
  'IN_PROGRESS': '进行中',
  'PENDING_CONFIRM': '待确认',
  'COMPLETED': '已完成',
  'CANCELLED': '已取消'
};

Page({
  data: {
    history: [],
    applications: [],
    totalHours: '0',
    todayHours: '0',
    todayPoints: 0
  },

  async onLoad() {
    await this.loadData();
  },

  async onPullDownRefresh() {
    await this.loadData();
    wx.stopPullDownRefresh();
  },

  async loadData() {
    try {
      const [list, apps, profile, stats] = await Promise.all([
        api.getMyRecords(),
        api.getMyApplications(),
        api.getProfile(),
        api.getRecordStats()
      ]);
      const totalHours = profile.totalHours
        ? (Number(profile.totalHours) % 1 === 0 ? Number(profile.totalHours) : Number(profile.totalHours).toFixed(1))
        : '0';
      this.setData({
        totalHours,
        todayHours: stats.todayHours
          ? (Number(stats.todayHours) % 1 === 0 ? Number(stats.todayHours) : Number(stats.todayHours).toFixed(1))
          : '0',
        todayPoints: stats.todayPoints || 0,
        history: (list || []).map(r => ({
          id: r.id,
          title: r.title || '',
          time: r.time || '',
          location: r.location || '',
          duration: r.duration ? '+' + r.duration : '',
          icon: 'history',
          status: r.status || '',
          statusText: STATUS_MAP[r.status] || r.status || ''
        })),
        applications: (apps || []).map(a => ({
          id: a.id,
          title: a.title || '',
          type: a.type || '',
          status: a.status || '',
          icon: TYPE_ICON_MAP[a.type] || 'support-agent',
          statusText: STATUS_MAP[a.status] || a.status || ''
        }))
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
