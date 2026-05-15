Component({
  properties: {
    title: { type: String, value: '互助养老' },
    showBack: { type: Boolean, value: false },
    showAvatar: { type: Boolean, value: false },
    showNotify: { type: Boolean, value: false },
    notifyCount: { type: Number, value: 0 },
    avatarSrc: { type: String, value: '' },
    bgColor: { type: String, value: 'rgba(255,255,255,0.9)' },
    rightIcon: { type: String, value: '' }
  },
  data: {
    statusBarHeight: 0
  },
  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    }
  },
  methods: {
    onBack() {
      wx.navigateBack();
    },
    onNotify() {
      wx.navigateTo({ url: '/pages/announcement/announcement' });
    },
    onRightTap() {
      this.triggerEvent('righttap');
    }
  }
});
