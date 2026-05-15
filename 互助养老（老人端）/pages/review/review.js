const api = require('../../utils/api');

Page({
  data: {
    rating: 0,
    comment: '',
    taskId: '',
    toUserId: '',
    volunteerName: '',
    volunteerAvatar: ''
  },

  onLoad(options) {
    const taskId = options.taskId || '';
    const toUserId = options.toUserId || '';

    this.setData({
      taskId,
      toUserId,
      volunteerName: options.volunteerName || '志愿者',
      volunteerAvatar: options.volunteerAvatar || ''
    });

    if (toUserId) {
      this.loadVolunteerInfo();
    } else if (taskId) {
      this.loadTaskInfo();
    }
  },

  async loadVolunteerInfo() {
    try {
      const user = await api.getUserInfo(this.data.toUserId);
      if (user.name || user.avatar) {
        this.setData({
          volunteerName: user.name || this.data.volunteerName,
          volunteerAvatar: user.avatar || this.data.volunteerAvatar
        });
      }
    } catch (_) {}
  },

  async loadTaskInfo() {
    try {
      const task = await api.getTask(this.data.taskId);
      if (task.volunteerId) {
        this.setData({ toUserId: String(task.volunteerId) });
        if (task.volunteerName) {
          this.setData({ volunteerName: task.volunteerName });
        }
        if (task.volunteerAvatar) {
          this.setData({ volunteerAvatar: task.volunteerAvatar });
        }
        this.loadVolunteerInfo();
      }
    } catch (_) {}
  },

  goBack() { wx.navigateBack(); },

  setRating(e) {
    const star = parseInt(e.currentTarget.dataset.star);
    this.setData({ rating: star });
  },

  onCommentInput(e) { this.setData({ comment: e.detail.value }); },

  async submitReview() {
    const { rating, taskId, toUserId } = this.data;
    if (!rating) {
      wx.showToast({ title: '请给个评分', icon: 'none' });
      return;
    }
    if (!taskId) {
      wx.showToast({ title: '任务信息缺失', icon: 'none' });
      return;
    }
    if (!toUserId) {
      wx.showToast({ title: '志愿者信息缺失', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '提交中...' });
      await api.reviewRecord(taskId, toUserId, rating, this.data.comment);
      wx.hideLoading();
      wx.showToast({ title: '评价成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '评价失败', icon: 'none' });
    }
  }
});
