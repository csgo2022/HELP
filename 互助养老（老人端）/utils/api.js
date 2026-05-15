const req = require('./request');

module.exports = {
  // 认证
  login(phone, password) { return req.post('/auth/login', { phone, password }); },
  register(phone, password, role) { return req.post('/auth/register', { phone, password, role }); },
  resetPassword(phone, newPassword) { return req.put('/user/reset-password', { phone, newPassword }); },

  // 用户
  getProfile() { return req.get('/user/profile'); },
  getUserInfo(userId) { return req.get(`/user/${userId}`); },
  updateProfile(data) { return req.put('/user/profile', data); },
  changePassword(oldPassword, newPassword) { return req.put('/user/password', { oldPassword, newPassword }); },
  realnameAuth(realName, idCard) { return req.post('/user/realname-auth', { realName, idCard }); },

  // 公告
  getAnnouncements() { return req.get('/announcements'); },
  getAnnouncement(id) { return req.get(`/announcements/${id}`); },

  // 任务
  getMyTasks() { return req.get('/tasks/my'); },
  getTask(id) { return req.get(`/tasks/${id}`); },
  createTask(data) { return req.post('/tasks', data); },
  getApplicants(taskId) { return req.get(`/tasks/${taskId}/applicants`); },
  assignVolunteer(taskId, volunteerId) { return req.post(`/tasks/${taskId}/assign`, { volunteerId }); },
  cancelTask(taskId) { return req.post(`/tasks/${taskId}/cancel`); },
  getCompletionInfo(taskId) { return req.get(`/tasks/${taskId}/completion-info`); },
  confirmTask(taskId) { return req.post(`/tasks/${taskId}/confirm`); },

  // 上传
  uploadAvatar(filePath) { return req.uploadFile('/upload/avatar', filePath, 'file'); },
  uploadFile(filePath) { return req.uploadFile('/upload', filePath, 'file'); },

  // 评价
  reviewRecord(taskId, toUserId, rating, comment) {
    return req.post(`/tasks/${taskId}/review`, { toUserId, rating, comment });
  },
  getTaskReview(taskId) { return req.get(`/tasks/${taskId}/review`); },
  getMyReviews() { return req.get('/reviews/sent'); },
  getUserReviews(userId) { return req.get(`/reviews/user/${userId}`); },

  // 健康
  getHealthRecords() { return req.get('/health-records'); },
  createHealthRecord(image, note) { return req.post('/health-records', { image, note }); },
  analyzeHealthRecord(filePath) { return req.uploadFile('/health-records/analyze', filePath, 'file'); },

  // 地址
  getAddresses() { return req.get('/addresses'); },
  createAddress(data) { return req.post('/addresses', data); },
  deleteAddress(id) { return req.del(`/addresses/${id}`); },

  // 家属
  getFamilyBindings() { return req.get('/family-bindings'); },
  createFamilyBinding(familyName, familyPhone) { return req.post('/family-bindings', { familyName, familyPhone }); },
  deleteFamilyBinding(id) { return req.del(`/family-bindings/${id}`); },
  // 账号
  deleteAccount() { return req.del('/user/account'); },
};
