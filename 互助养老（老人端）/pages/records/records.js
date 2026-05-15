const api = require('../../utils/api');

// 状态映射: 后端状态 → 前端状态
function mapStatus(status) {
  switch (status) {
    case 'PENDING': return 'waiting';
    case 'MATCHING': return 'waiting';
    case 'IN_PROGRESS': return 'in_progress';
    case 'COMPLETED': return 'completed';
    case 'PENDING_CONFIRM': return 'pending_confirm';
    case 'CANCELLED': return 'cancelled';
    default: return 'waiting';
  }
}

Page({
  data: {
    tab: 'active',
    records: [],
    filteredRecords: []
  },

  async onShow() {
    await this.loadRecords();
  },

  async loadRecords() {
    try {
      const [tasks, reviews] = await Promise.all([
        api.getMyTasks(),
        api.getMyReviews().catch(() => [])
      ]);
      const reviewedTaskIds = new Set((reviews || []).map(r => String(r.taskId)));
      const records = (tasks || []).map(t => ({
        id: String(t.id),
        type: t.type || '',
        target: t.requesterName || '',
        time: t.appointmentDate ? (t.appointmentDate + (t.appointmentTime ? ' ' + t.appointmentTime : '')) : '',
        status: mapStatus(t.status),
        description: t.description || '',
        address: t.address || '',
        applicantCount: t.applicantCount || 0,
        reviewed: reviewedTaskIds.has(String(t.id))
      }));
      this.setData({ records }, () => this.filterRecords());
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab }, () => this.filterRecords());
  },

  filterRecords() {
    const filtered = this.data.records.filter(r => {
      if (this.data.tab === 'active') return r.status !== 'completed' && r.status !== 'cancelled';
      if (this.data.tab === 'completed') return r.status === 'completed';
      return false;
    });
    this.setData({ filteredRecords: filtered });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    const record = this.data.records.find(r => r.id === id);
    if (record) {
      wx.navigateTo({ url: `/pages/service_detail/service_detail?id=${id}` });
    }
  },

  goReview(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/review/review?taskId=${id}` });
  },
  goHome() { wx.navigateTo({ url: '/pages/home/home' }); },
  goRequest() { wx.navigateTo({ url: '/pages/request/request' }); },
  goProfile() { wx.navigateTo({ url: '/pages/profile/profile' }); }
});
