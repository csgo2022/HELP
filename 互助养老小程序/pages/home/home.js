const api = require('../../utils/api');

Page({
  data: {
    userName: '志愿者',
    serviceCount: 0,
    totalHours: '0',
    points: 0,
    pendingTasks: []
  },

  async onLoad() {
    try {
      const profile = await api.getProfile();
      this.setData({
        userName: profile.name || '志愿者',
        serviceCount: profile.serviceCount || 0,
        totalHours: profile.totalHours ? (Number(profile.totalHours) % 1 === 0 ? Number(profile.totalHours) + 'h' : Number(profile.totalHours).toFixed(1) + 'h') : '0h',
        points: profile.points || 0
      });
    } catch (e) {
      console.error('加载用户信息失败', e);
    }
    await this.loadPendingTasks();
  },

  async loadPendingTasks() {
    try {
      const list = await api.getTasks();
      this.setData({ pendingTasks: (list || []).slice(0, 5).map(t => ({
        id: t.id,
        title: t.title || '',
        requesterName: t.requesterName || '发布人',
        address: t.address || '',
        time: t.appointmentDate ? (t.appointmentDate + (t.appointmentTime ? ' ' + t.appointmentTime : '')) : '',
        reward: t.rewardHours ? t.rewardHours + 'h' : '',
        icon: 'heart-pulse'
      })) });
    } catch (e) {
      console.error('加载待接单任务失败', e);
    }
  },

  onSignup(e) {
    const id = e.currentTarget.dataset.id;
    if (id) {
      wx.navigateTo({ url: `/pages/service-detail/service-detail?id=${id}` });
    }
  }
});