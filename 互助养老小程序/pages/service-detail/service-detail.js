const api = require('../../utils/api');

function mapStatus(status) {
  switch (status) {
    case 'PENDING': return { text: '待接单', cls: 'pending' };
    case 'MATCHING': return { text: '匹配中', cls: 'matching' };
    case 'IN_PROGRESS': return { text: '服务中', cls: 'in_progress' };
    case 'COMPLETED': return { text: '已完成', cls: 'completed' };
    case 'PENDING_CONFIRM': return { text: '待确认', cls: 'pending_confirm' };
    case 'CANCELLED': return { text: '已取消', cls: 'cancelled' };
    default: return { text: status, cls: '' };
  }
}

Page({
  data: {
    id: '',
    task: null,
    review: null
  },

  onLoad(options) {
    this.setData({ id: options.id || '' });
  },

  onShow() {
    if (this.data.id) {
      this.loadTaskData(this.data.id);
    }
  },

  async loadTaskData(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      const task = await api.getTask(id);
      const st = mapStatus(task.status);

      let review = null;
      if (task.status === 'COMPLETED') {
        try {
          review = await api.getTaskReview(id);
        } catch (_) {}
      }

      wx.hideLoading();
      this.setData({
        task: {
          id: task.id,
          title: task.title,
          type: task.type,
          description: task.description,
          address: task.address,
          status: task.status,
          statusText: st.text,
          statusClass: st.cls,
          rewardHours: task.rewardHours,
          appointmentDate: task.appointmentDate,
          appointmentTime: task.appointmentTime,
          duration: task.duration,
          requesterName: task.requesterName,
          volunteerName: task.volunteerName,
          applicantCount: task.applicantCount,
          createdAt: task.createdAt
        },
        review
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  async onSignup() {
    const { id } = this.data;
    if (!id) return;
    try {
      wx.showLoading({ title: '报名中...' });
      await api.applyTask(id);
      wx.hideLoading();
      wx.showToast({ title: '报名成功！', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/booking/booking' }), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '报名失败', icon: 'none' });
    }
  },

  onCompleteService() {
    const { id } = this.data;
    if (!id) return;
    wx.navigateTo({ url: `/pages/submit-completion/submit-completion?id=${id}` });
  },

  goToAiGuidance() {
    const { id } = this.data;
    if (!id) return;
    wx.navigateTo({ url: `/pages/ai-guidance/ai-guidance?taskId=${id}` });
  },
});
