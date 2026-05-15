App({
  globalData: {
    isAuthenticated: false,
    userInfo: null,
    systemInfo: null,
    apiBaseUrl: 'http://localhost:8080/api/mini'
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    this.globalData.isAuthenticated = !!token;

    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
      }
    });
  },

  onShow() {
    const token = wx.getStorageSync('token');
    const pages = getCurrentPages();
    if (pages.length === 0) return;
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route;

    if (!token && route !== 'pages/login/login' && route !== 'pages/register/register') {
      wx.redirectTo({ url: '/pages/login/login' });
    }
    if (token && (route === 'pages/login/login' || route === 'pages/register/register')) {
      wx.switchTab({ url: '/pages/home/home' });
    }
  },

});
