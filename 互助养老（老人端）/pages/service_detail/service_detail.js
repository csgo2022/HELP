const api = require('../../utils/api');

Page({
  data: {
    record: {},
    completionInfo: null,
    review: null
  },

  onLoad(options) {
    this.setData({ 'record.id': options.id || '' });
  },

  onShow() {
    if (this.data.record.id) {
      this.loadTaskData(this.data.record.id);
    }
  },

  async loadTaskData(id) {
    try {
      wx.showLoading({ title: '加载中...' });
      const task = await api.getTask(id);
      let applicants = [];
      try {
        applicants = await api.getApplicants(id);
      } catch (_) { /* 可能无报名者 */ }
      wx.hideLoading();

      const record = {
        id: String(task.id),
        type: task.type || '',
        target: task.requesterName || '',
        time: task.appointmentDate ? (task.appointmentDate + (task.appointmentTime ? ' ' + task.appointmentTime : '')) : '',
        status: task.status === 'COMPLETED' ? 'completed' : task.status === 'CANCELLED' ? 'cancelled' : task.status === 'PENDING_CONFIRM' ? 'pending_confirm' : (task.status === 'IN_PROGRESS' || task.volunteerId ? 'in_progress' : 'waiting'),
        description: task.description || '',
        address: task.address || '',
        applicants: (applicants || []).map(a => ({
          id: String(a.volunteerId),
          name: a.name || '志愿者',
          avatar: a.avatar || '',
          phone: a.phone || '',
          totalHours: a.totalHours || '',
          rating: a.rating || '',
          serviceCount: a.serviceCount || 0,
          isGold: a.isGold || false,
          volunteerId: a.volunteerId
        })),
        volunteer: task.volunteerId ? { id: String(task.volunteerId), name: task.volunteerName || '志愿者', avatar: task.volunteerAvatar || '', phone: task.volunteerPhone || '', rating: task.volunteerRating || '', serviceCount: task.volunteerServiceCount || 0 } : null
      };
      this.setData({ record });
      if (task.status === 'PENDING_CONFIRM') {
        this.loadCompletionInfo();
      }
      if (task.status === 'COMPLETED') {
        this.loadReview();
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },

  async loadCompletionInfo() {
    try {
      const info = await api.getCompletionInfo(this.data.record.id);
      this.setData({ completionInfo: info });
    } catch (e) {
      console.error('加载完成信息失败', e);
    }
  },

  async loadReview() {
    try {
      const review = await api.getTaskReview(this.data.record.id);
      this.setData({ review });
    } catch (_) {}
  },

  previewPhoto(e) {
    const url = e.currentTarget.dataset.url;
    if (this.data.completionInfo && this.data.completionInfo.photos) {
      wx.previewImage({ urls: this.data.completionInfo.photos, current: url });
    }
  },

  async onConfirmCompletion() {
    try {
      const confirmed = await new Promise(resolve => {
        wx.showModal({
          title: '确认完成',
          content: '请确认志愿者已完成服务？',
          success: (res) => resolve(res.confirm)
        });
      });
      if (!confirmed) return;

      wx.showLoading({ title: '确认中...' });
      await api.confirmTask(this.data.record.id);
      wx.hideLoading();

      // Navigate to review page
      const volunteer = this.data.record.volunteer;
      if (volunteer) {
        wx.navigateTo({
          url: `/pages/review/review?taskId=${this.data.record.id}&toUserId=${volunteer.id}&volunteerName=${encodeURIComponent(volunteer.name)}&volunteerAvatar=${encodeURIComponent(volunteer.avatar || '')}`
        });
      } else {
        wx.showToast({ title: '确认成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  },

  goVolunteer(e) {
    const index = e.currentTarget.dataset.volindex;
    const volunteer = index !== undefined ? this.data.record.applicants[index] : this.data.record.volunteer;
    wx.setStorageSync('volunteer', {
      id: volunteer.id || '',
      name: volunteer.name || '志愿者',
      avatar: volunteer.avatar || '',
      phone: volunteer.phone || '',
      totalHours: volunteer.totalHours || '0',
      rating: volunteer.rating || '0',
      serviceCount: volunteer.serviceCount || 0,
      isGold: volunteer.isGold || false
    });
    wx.navigateTo({ url: '/pages/volunteer_detail/volunteer_detail' });
  },

  async onCancel() {
    try {
      const confirmed = await new Promise(resolve => {
        wx.showModal({
          title: '确认取消',
          content: '确定取消本次预约吗？',
          success: (res) => resolve(res.confirm)
        });
      });
      if (!confirmed) return;

      wx.showLoading({ title: '取消中...' });
      await api.cancelTask(this.data.record.id);
      wx.hideLoading();
      wx.showToast({ title: '已取消预约', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '取消失败', icon: 'none' });
    }
  },

  async selectVolunteer(e) {
    const index = e.currentTarget.dataset.index;
    const applicant = this.data.record.applicants[index];
    if (!applicant) return;

    try {
      const confirmed = await new Promise(resolve => {
        wx.showModal({
          title: '确认选择',
          content: `确定选择该志愿者吗？`,
          success: (res) => resolve(res.confirm)
        });
      });
      if (!confirmed) return;

      wx.showLoading({ title: '操作中...' });
      await api.assignVolunteer(this.data.record.id, applicant.volunteerId);
      wx.hideLoading();
      const record = { ...this.data.record, status: 'in_progress', volunteer: {
        id: applicant.id,
        name: applicant.name,
        avatar: applicant.avatar,
        phone: applicant.phone,
        rating: applicant.rating,
        serviceCount: applicant.serviceCount
      } };
      this.setData({ record });
      wx.showToast({ title: '已选择志愿者', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  }
});
