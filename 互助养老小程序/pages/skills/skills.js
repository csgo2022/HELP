const api = require('../../utils/api');

Page({
  data: {
    selected: [],
    skills: [],
    skillText: '',
    textCount: 0
  },

  async onLoad() {
    try {
      wx.showLoading({ title: '加载中...' });
      const [skills, profile] = await Promise.all([
        api.getAllSkills(),
        api.getProfile()
      ]);
      wx.hideLoading();

      const userSkillNames = profile.tags || [];

      const allSkills = [];
      const seen = {};
      (skills || []).forEach(s => {
        if (!seen[s.name]) {
          seen[s.name] = true;
          allSkills.push({
            id: s.id,
            name: s.name,
            icon: s.icon || '',
            active: userSkillNames.indexOf(s.name) !== -1
          });
        }
      });

      this.setData({
        skills: allSkills,
        selected: allSkills.filter(s => s.active).map(s => s.name),
        skillText: profile.skillText || ''
      });
      this.setData({ textCount: this.data.skillText.length });
    } catch (e) {
      wx.hideLoading();
      console.error('加载技能数据失败', e);
    }
  },

  toggleSkill(e) {
    const name = e.currentTarget.dataset.name;
    const skills = this.data.skills.map(s =>
      s.name === name ? { ...s, active: !s.active } : s
    );
    this.setData({
      skills,
      selected: skills.filter(s => s.active).map(s => s.name)
    });
  },

  onTextInput(e) {
    const value = e.detail.value;
    this.setData({ skillText: value, textCount: value.length });
  },

  async onSave() {
    const nameToId = {};
    this.data.skills.forEach(s => { nameToId[s.name] = s.id; });
    const skillIds = this.data.selected.map(name => nameToId[name]).filter(id => id);
    try {
      wx.showLoading({ title: '保存中...' });
      await api.updateSkills(skillIds, this.data.skillText || '');
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
