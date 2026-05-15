const req = require('./request');

module.exports = {
  // 认证
  login(phone, password) { return req.post('/auth/login', { phone, password }); },
  register(phone, password, role) { return req.post('/auth/register', { phone, password, role }); },
  resetPassword(phone, newPassword) { return req.put('/user/reset-password', { phone, newPassword }); },

  // 用户
  getProfile() { return req.get('/user/profile'); },
  updateProfile(data) { return req.put('/user/profile', data); },
  changePassword(oldPassword, newPassword) { return req.put('/user/password', { oldPassword, newPassword }); },
  getAllSkills() { return req.get('/user/skills'); },
  updateSkills(skillIds, description) { return req.put('/user/skills', { skillIds, description }); },

  // 公告
  getAnnouncements() { return req.get('/announcements'); },
  getAnnouncement(id) { return req.get(`/announcements/${id}`); },

  // 任务
  getTasks() { return req.get('/tasks'); },
  getTask(id) { return req.get(`/tasks/${id}`); },
  applyTask(id) { return req.post(`/tasks/${id}/apply`); },
  getMyApplications() { return req.get('/tasks/my-applications'); },

  // 服务记录
  getMyRecords() { return req.get('/records'); },
  getRecordStats() { return req.get('/records/stats'); },
  getRecord(id) { return req.get(`/records/${id}`); },

  // 排行榜
  getLeaderboard(period) { return req.get(`/leaderboard?period=${period}`); },

  // 积分商城
  getProducts() { return req.get('/point-mall/products'); },
  getPointsBalance() { return req.get('/point-mall/balance'); },
  getExchangeRate() { return req.get('/point-mall/exchange-rate'); },

  // 订单
  getOrders() { return req.get('/orders'); },
  getOrder(id) { return req.get(`/orders/${id}`); },
  createOrder(data) { return req.post('/orders', data); },
  getLogistics(orderId) { return req.get(`/orders/${orderId}/logistics`); },

  // 地址
  getAddresses() { return req.get('/addresses'); },
  createAddress(data) { return req.post('/addresses', data); },
  deleteAddress(id) { return req.del(`/addresses/${id}`); },

  // 上传
  uploadAvatar(filePath) { return req.uploadFile('/upload/avatar', filePath, 'file'); },
  submitCompletion(taskId, data) { return req.post(`/tasks/${taskId}/submit-completion`, data); },
  getCompletionInfo(taskId) { return req.get(`/tasks/${taskId}/completion-info`); },
  uploadTempFile(filePath) { return req.uploadFile('/upload', filePath, 'file'); },

  // 评价
  getTaskReview(taskId) { return req.get(`/tasks/${taskId}/review`); },
  getReceivedReviews() { return req.get('/reviews/received'); },

  // AI 智能指导
  getAiGuidance(taskId) { return req.get(`/ai/guidance?taskId=${taskId}`); },
  // 账号
  deleteAccount() { return req.del('/user/account'); },
};
