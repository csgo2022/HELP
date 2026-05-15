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

Page({
  data: {
    activeFilter: 0,
    searchKeyword: '',
    tasks: [],
    filteredTasks: [],
    categories: []
  },

  async onLoad() {
    await this.loadTasks();
  },

  async onShow() {
    await this.loadTasks();
  },

  async onPullDownRefresh() {
    await this.loadTasks();
    wx.stopPullDownRefresh();
  },

  async loadTasks() {
    try {
      const list = await api.getTasks();
      const tasks = (list || []).map(t => ({
        id: t.id,
        type: t.type || '',
        title: t.title || '',
        address: t.address || '',
        time: t.appointmentDate ? (t.appointmentDate + (t.appointmentTime ? ' ' + t.appointmentTime : '')) : '',
        description: t.description || '',
        reward: t.rewardHours ? t.rewardHours + 'h' : '',
        icon: TYPE_ICON_MAP[t.type] || 'support-agent'
      }));

      // Extract unique categories from task data
      const typeSet = new Set();
      tasks.forEach(t => { if (t.type) typeSet.add(t.type); });
      const categories = Array.from(typeSet);

      this.setData({
        tasks,
        categories,
        filteredTasks: tasks,
        activeFilter: 0,
        searchKeyword: ''
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword });
    this.applyFilter();
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' });
    this.applyFilter();
  },

  onFilterTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ activeFilter: index });
    this.applyFilter();
  },

  applyFilter() {
    const { tasks, categories, activeFilter, searchKeyword } = this.data;
    let result = tasks;

    // Filter by category
    if (activeFilter > 0 && categories[activeFilter]) {
      const type = categories[activeFilter];
      result = result.filter(t => t.type === type);
    }

    // Filter by keyword
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(t =>
        (t.title && t.title.toLowerCase().includes(kw)) ||
        (t.description && t.description.toLowerCase().includes(kw))
      );
    }

    this.setData({ filteredTasks: result });
  }
});
