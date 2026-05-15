const api = require('../../utils/api');

Page({
  data: {
    taskId: '',
    loading: true,
    guidance: null,
    answered: false,
    selectedAnswer: '',
    isCorrect: false,
    checklist: []
  },

  onLoad(options) {
    const taskId = options.taskId || '';
    this.setData({ taskId });
    if (taskId) {
      this.loadGuidance(taskId);
    } else {
      this.findInProgressTask();
    }
  },

  async findInProgressTask() {
    try {
      const apps = await api.getMyApplications();
      const inProgress = (apps || []).filter(a => a.status === 'IN_PROGRESS');
      if (inProgress.length === 0) {
        wx.showToast({ title: '没有进行中的服务', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      } else if (inProgress.length === 1) {
        const taskId = String(inProgress[0].id);
        this.setData({ taskId });
        this.loadGuidance(taskId);
      } else {
        wx.showToast({ title: '有多个进行中的服务，请从服务详情进入', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (e) {
      wx.showToast({ title: '获取任务信息失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  async loadGuidance(taskId) {
    try {
      wx.showLoading({ title: 'AI 生成中...' });
      const guidance = await api.getAiGuidance(taskId);
      wx.hideLoading();
      this.setData({
        guidance,
        loading: false,
        checklist: (guidance.checklist || []).map(item => ({ ...item, checked: false }))
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '获取指导失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onOptionTap(e) {
    if (this.data.answered) return;

    const { option } = e.currentTarget.dataset;
    const correct = this.data.guidance.question.correctAnswer;
    const isCorrect = option === correct;

    this.setData({
      answered: true,
      selectedAnswer: option,
      isCorrect
    });

    wx.showToast({
      title: isCorrect ? '回答正确！' : '回答错误',
      icon: isCorrect ? 'success' : 'none'
    });
  },

  onCheckboxTap(e) {
    const index = e.currentTarget.dataset.index;
    const key = `checklist[${index}].checked`;
    this.setData({ [key]: !this.data.checklist[index].checked });
  },

  onStartNavigate() {
    wx.redirectTo({ url: `/pages/service-detail/service-detail?id=${this.data.taskId}` });
  },

  goBack() {
    wx.navigateBack();
  }
});
