const api = require('../../utils/api');

Page({
  data: {
    volunteer: {
      name: '志愿者',
      avatar: '',
      phone: '',
      skills: [],
      rating: '',
      totalHours: '',
      reviewCount: 0,
      reviews: []
    }
  },

  onLoad() {
    const cached = wx.getStorageSync('volunteer') || {};
    this.setData({
      volunteer: {
        id: cached.id || '',
        name: cached.name || '志愿者',
        avatar: cached.avatar || '',
        phone: cached.phone || '',
        skills: cached.skills || [],
        rating: cached.rating || '',
        totalHours: cached.totalHours || '',
        reviewCount: cached.reviewCount || 0,
        reviews: cached.reviews || []
      }
    });

    // 加载真实评价数据
    if (cached.id) {
      this.loadReviews(cached.id);
      this.loadSkills(cached.id);
    }
  },

  async loadReviews(userId) {
    try {
      const reviews = await api.getUserReviews(userId);
      this.setData({
        'volunteer.reviews': (reviews || []).map(r => ({
          id: r.id,
          author: r.fromUserName || '用户',
          avatar: r.fromUserAvatar || '',
          rating: r.rating || 5,
          comment: r.comment || '',
          date: r.createdAt ? r.createdAt.substring(0, 10) : ''
        })),
        'volunteer.reviewCount': (reviews || []).length,
        'volunteer.rating': reviews.length > 0
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          : this.data.volunteer.rating
      });
    } catch (e) {
      console.error('加载评价失败', e);
    }
  },

  async loadSkills(userId) {
    try {
      const info = await api.getUserInfo(userId);
      if (info) {
        const update = {};
        if (info.tags && info.tags.length > 0) {
          update['volunteer.skills'] = info.tags;
        }
        if (info.totalHours) {
          update['volunteer.totalHours'] = info.totalHours;
        }
        if (info.rating) {
          update['volunteer.rating'] = info.rating;
        }
        if (Object.keys(update).length > 0) {
          this.setData(update);
        }
      }
    } catch (e) {
      console.error('加载技能失败', e);
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onCall() {
    const phone = this.data.volunteer.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    } else {
      wx.showToast({ title: '暂无联系电话', icon: 'none' });
    }
  }
});
