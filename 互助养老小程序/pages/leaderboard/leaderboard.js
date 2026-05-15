const api = require('../../utils/api');

const AVATAR_COLORS = ['avatar-color-0', 'avatar-color-1', 'avatar-color-2', 'avatar-color-3', 'avatar-color-4', 'avatar-color-5'];

function getInitial(name) {
  if (!name) return '?';
  return name.charAt(0);
}

Page({
  data: {
    activeTab: 'weekly',
    topThree: [],
    listPlayers: [],
    currentUser: { name: '我', initial: '我', hours: 0, avatar: '' }
  },

  async onLoad() {
    await this.refreshLeaderboard(this.data.activeTab);
    try {
      const profile = await api.getProfile();
      this.setData({ 'currentUser.name': profile.name || '我', 'currentUser.initial': getInitial(profile.name) });
    } catch (e) { /* ignore */ }
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });
    this.refreshLeaderboard(tab);
  },

  async refreshLeaderboard(tab) {
    try {
      const list = await api.getLeaderboard(tab);
      const processed = (list || []).map((item, index) => ({
        rank: item.rank,
        name: item.name || '',
        score: item.score || '0h',
        avatar: item.avatar || '',
        initial: getInitial(item.name),
        colorIndex: index % AVATAR_COLORS.length
      }));
      this.setData({
        topThree: processed.slice(0, 3),
        listPlayers: processed.slice(3)
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
