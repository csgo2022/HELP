# 互助养老（老人端）API 对接 — 执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将老人端微信小程序从静态数据改为调用后端 API，无后端接口的页面保持静态。

**Architecture:** 创建 `utils/request.js` 封装 wx.request（统一鉴权、错误处理、401 跳转），创建 `utils/api.js` 提供域名化的 API 函数，逐页替换数据源。后端路径前缀为 `/api/mini`。

**Tech Stack:** 微信小程序原生 (JavaScript, WXML, WXSS), RESTful API

---

## 文件结构

### 新建文件
| 文件 | 职责 |
|------|------|
| `utils/request.js` | HTTP 请求封装 — baseURL、token 自动携带、ApiResponse 解析、401 处理 |
| `utils/api.js` | 所有后端 API 的调用函数集合，每个函数返回 Promise |

### 修改文件
| 文件 | 改动 |
|------|------|
| `app.js` | 添加 `apiBaseUrl` 全局配置 |
| `pages/login/login.js` | 调用登录 API，保存 token |
| `pages/register/register.js` | 调用注册 API，保存 token |
| `pages/announcements/announcements.js` | 替换 data.js → 调用公告列表 API |
| `pages/announcement_detail/announcement_detail.js` | 替换 data.js → 调用公告详情 API |
| `pages/request/request.js` | 替换 toast 占位 → 调用创建任务 API |
| `pages/records/records.js` | 替换 MOCK_RECORDS → 调用我的任务 API |
| `pages/service_detail/service_detail.js` | 替换 MOCK_RECORDS → 调用任务详情+报名者+指派 API |
| `pages/review/review.js` | 替换 toast 占位 → 调用评价 API |
| `pages/health/health.js` | 替换 toast 占位 → 调用健康记录 API |
| `pages/edit_profile/edit_profile.js` | 加载/保存时调用用户资料 API |
| `pages/change_password/change_password.js` | 替换 toast → 调用修改密码 API |
| `pages/realname_auth/realname_auth.js` | 替换 toast → 调用实名认证 API |
| `pages/address_book/address_book.js` | 加载时调用地址列表 API |
| `pages/add_address/add_address.js` | 替换 toast → 调用新增地址 API |
| `pages/bind_family/bind_family.js` | 加载/绑定时调用家属 API |

### 不修改的页面（保持静态）
`home.js`, `profile.js`, `profile_settings.js`, `account_security.js`, `volunteer_detail.js`, `change_phone.js`

---

### Task 1: 创建 HTTP 请求封装 `utils/request.js`

**Files:**
- Create: `utils/request.js` (需先创建 `utils/` 目录)

- [ ] **创建 utils/ 目录**

```bash
mkdir -p "D:/互助养老3/互助养老（老人端）/utils"
```

- [ ] **创建 utils/request.js**

```javascript
const app = getApp();

function request(method, url, data) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const header = { 'Content-Type': 'application/json' };
    if (token) header['Authorization'] = `Bearer ${token}`;

    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      header,
      data,
      success(res) {
        const body = res.data;
        if (body.code === 200) {
          resolve(body.data);
        } else if (body.code === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('user');
          wx.reLaunch({ url: '/pages/login/login' });
          reject(new Error(body.message || '登录已过期'));
        } else {
          reject(new Error(body.message || '请求失败'));
        }
      },
      fail(err) {
        reject(new Error('网络错误，请检查网络连接'));
      }
    });
  });
}

module.exports = {
  get(url) { return request('GET', url); },
  post(url, data) { return request('POST', url, data); },
  put(url, data) { return request('PUT', url, data); },
  del(url) { return request('DELETE', url); }
};
```

---

### Task 2: 创建 API 函数集合 `utils/api.js`

**Files:**
- Create: `utils/api.js`

- [ ] **创建 utils/api.js**

```javascript
const req = require('./request');

module.exports = {
  // 认证
  login(phone, password) { return req.post('/auth/login', { phone, password }); },
  register(phone, password, role) { return req.post('/auth/register', { phone, password, role }); },

  // 用户
  getProfile() { return req.get('/user/profile'); },
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

  // 评价
  reviewRecord(recordId, taskId, toUserId, rating, comment) {
    return req.post(`/records/${recordId}/review`, { taskId, toUserId, rating, comment });
  },

  // 健康
  getHealthRecords() { return req.get('/health-records'); },
  createHealthRecord(image, note) { return req.post('/health-records', { image, note }); },

  // 地址
  getAddresses() { return req.get('/addresses'); },
  createAddress(data) { return req.post('/addresses', data); },

  // 家属
  getFamilyBindings() { return req.get('/family-bindings'); },
  createFamilyBinding(familyName, familyPhone) { return req.post('/family-bindings', { familyName, familyPhone }); },
  deleteFamilyBinding(id) { return req.del(`/family-bindings/${id}`); }
};
```

---

### Task 3: 添加全局配置 `app.js`

**Files:**
- Modify: `app.js`

- [ ] **修改 app.js — 添加 apiBaseUrl**

```javascript
App({
  globalData: {
    userInfo: null,
    apiBaseUrl: 'http://localhost:8080/api/mini'
  }
})
```

---

### Task 4: 对接登录页 `pages/login/login.js`

**Files:**
- Modify: `pages/login/login.js`

- [ ] **重写 handleLogin — 调用登录 API，保存 token**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    loginType: 'phone',
    phoneNumber: '',
    code: '',
    account: '',
    password: '',
    agreed: true
  },

  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loginType: type });
  },

  onPhoneInput(e) { this.setData({ phoneNumber: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onAccountInput(e) { this.setData({ account: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },

  onAgreeChange(e) {
    this.setData({ agreed: e.detail.value.length > 0 });
  },

  getCode() {
    wx.showToast({ title: '验证码已发送', icon: 'none' });
  },

  async handleLogin() {
    const { loginType, phoneNumber, account, password, agreed } = this.data;
    if (!agreed) {
      wx.showToast({ title: '请同意用户协议', icon: 'none' });
      return;
    }
    try {
      const phone = loginType === 'phone' ? phoneNumber : account;
      const pwd = loginType === 'phone' ? code : password;
      if (!phone || !pwd) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }
      wx.showLoading({ title: '登录中...' });
      const res = await api.login(phone, pwd);
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.reLaunch({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '登录失败', icon: 'none' });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/register' });
  }
});
```

---

### Task 5: 对接注册页 `pages/register/register.js`

**Files:**
- Modify: `pages/register/register.js`

- [ ] **重写 handleRegister — 调用注册 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    phoneNumber: '',
    code: '',
    password: '',
    confirmPassword: ''
  },

  onPhoneInput(e) { this.setData({ phoneNumber: e.detail.value }); },
  onCodeInput(e) { this.setData({ code: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onConfirmPasswordInput(e) { this.setData({ confirmPassword: e.detail.value }); },

  getCode() {
    wx.showToast({ title: '验证码已发送', icon: 'none' });
  },

  async handleRegister() {
    const { phoneNumber, password, confirmPassword } = this.data;
    if (!phoneNumber || !password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '注册中...' });
      const res = await api.register(phoneNumber, password, 'ELDERLY');
      wx.hideLoading();
      wx.setStorageSync('token', res.accessToken);
      wx.setStorageSync('user', { userId: res.userId, role: res.role, name: res.name });
      wx.reLaunch({ url: '/pages/home/home' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '注册失败', icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); }
});
```

---

### Task 6: 对接公告列表 `pages/announcements/announcements.js`

**Files:**
- Modify: `pages/announcements/announcements.js`
- Note: `data.js` 保留不动（后面公告详情页仍暂时使用）

- [ ] **重写 announcements.js — 从 API 加载公告列表**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    announcements: []
  },

  async onLoad() {
    try {
      const list = await api.getAnnouncements();
      this.setData({ announcements: list });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/announcement_detail/announcement_detail?id=${id}` });
  }
});
```

---

### Task 7: 对接公告详情 `pages/announcement_detail/announcement_detail.js`

**Files:**
- Modify: `pages/announcement_detail/announcement_detail.js`

- [ ] **重写 onLoad — 从 API 获取公告详情**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    title: '',
    date: '',
    tag: '',
    content: ''
  },

  async onLoad(options) {
    if (!options.id) return;
    try {
      const item = await api.getAnnouncement(options.id);
      this.setData({
        title: item.title,
        date: item.date || '',
        tag: item.category || '',
        content: item.content || ''
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); }
});
```

---

### Task 8: 对接发布求助 `pages/request/request.js`

**Files:**
- Modify: `pages/request/request.js`

- [ ] **重写 nextStep 提交逻辑 — 调用创建任务 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    step: 1,
    selectedType: '',
    remark: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '',
    today: ''
  },

  onLoad() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    this.setData({ today: `${y}-${m}-${d}` });
  },

  goBack() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 });
    } else {
      wx.navigateBack();
    }
  },

  selectService(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedType: type });
    this.nextStep();
  },

  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },
  onDateChange(e) { this.setData({ appointmentDate: e.detail.value }); },
  onTimeChange(e) { this.setData({ appointmentTime: e.detail.value }); },
  onDurationInput(e) { this.setData({ duration: e.detail.value }); },

  async nextStep() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
      return;
    }
    // Step 3 — 提交
    const { selectedType, remark, appointmentDate, appointmentTime, duration } = this.data;
    try {
      wx.showLoading({ title: '发布中...' });
      await api.createTask({
        type: selectedType,
        title: selectedType,
        description: remark,
        appointmentDate,
        appointmentTime,
        duration,
        remarks: remark
      });
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: '/pages/records/records' }), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '发布失败', icon: 'none' });
    }
  },

  prevStep() { this.setData({ step: this.data.step - 1 }); }
});
```

---

### Task 9: 对接服务记录 `pages/records/records.js`

**Files:**
- Modify: `pages/records/records.js`

- [ ] **重写 records.js — 从 API 获取任务列表，映射为前端格式**

```javascript
const api = require('../../utils/api');

// 状态映射: 后端状态 → 前端状态
function mapStatus(status) {
  switch (status) {
    case 'PENDING': return 'waiting';
    case 'IN_PROGRESS': return 'in_progress';
    case 'COMPLETED': return 'completed';
    default: return 'waiting';
  }
}

Page({
  data: {
    tab: 'active',
    records: [],
    filteredRecords: []
  },

  async onShow() {
    await this.loadRecords();
  },

  async loadRecords() {
    try {
      const tasks = await api.getMyTasks();
      const records = (tasks || []).map(t => ({
        id: String(t.id),
        type: t.type || '',
        target: t.requesterName || '',
        time: t.appointmentDate ? (t.appointmentDate + (t.appointmentTime ? ' ' + t.appointmentTime : '')) : '',
        status: mapStatus(t.status),
        description: t.description || '',
        address: t.address || '',
        applicantCount: t.applicantCount || 0
      }));
      this.setData({ records }, () => this.filterRecords());
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ tab }, () => this.filterRecords());
  },

  filterRecords() {
    const filtered = this.data.records.filter(r =>
      this.data.tab === 'active' ? r.status !== 'completed' : r.status === 'completed'
    );
    this.setData({ filteredRecords: filtered });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    const record = this.data.records.find(r => r.id === id);
    if (record && record.status !== 'completed') {
      wx.navigateTo({ url: `/pages/service_detail/service_detail?id=${id}` });
    }
  },

  goReview() { wx.navigateTo({ url: '/pages/review/review' }); },
  goHome() { wx.navigateTo({ url: '/pages/home/home' }); },
  goRequest() { wx.navigateTo({ url: '/pages/request/request' }); },
  goProfile() { wx.navigateTo({ url: '/pages/profile/profile' }); }
});
```

---

### Task 10: 对接服务详情 `pages/service_detail/service_detail.js`

**Files:**
- Modify: `pages/service_detail/service_detail.js`

- [ ] **重写 service_detail.js — 从 API 获取任务详情和报名者列表**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    record: {}
  },

  async onLoad(options) {
    const id = options.id;
    if (!id) return;
    try {
      wx.showLoading({ title: '加载中...' });
      const task = await api.getTask(id);
      let applicants = [];
      try {
        applicants = await api.getApplicants(id);
      } catch (_) { /* 可能无报名者 */ }
      wx.hideLoading();

      const record = {
        id: String(task.id),
        type: task.type || '',
        target: task.requesterName || '',
        time: task.appointmentDate ? (task.appointmentDate + (task.appointmentTime ? ' ' + task.appointmentTime : '')) : '',
        status: task.status === 'COMPLETED' ? 'completed' : (task.status === 'IN_PROGRESS' || task.volunteerId ? 'in_progress' : 'waiting'),
        description: task.description || '',
        address: task.address || '',
        applicants: (applicants || []).map(a => ({
          id: String(a.volunteerId),
          name: '志愿者',
          avatar: '',
          volunteerId: a.volunteerId
        })),
        volunteer: task.volunteerId ? { id: String(task.volunteerId), name: task.volunteerName || '志愿者', avatar: '' } : null
      };
      this.setData({ record });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },

  goVolunteer(e) {
    const index = e.currentTarget.dataset.volindex;
    const volunteer = index !== undefined ? this.data.record.applicants[index] : this.data.record.volunteer;
    wx.setStorageSync('volunteer', volunteer);
    wx.navigateTo({ url: '/pages/volunteer_detail/volunteer_detail' });
  },

  async selectVolunteer(e) {
    const index = e.currentTarget.dataset.index;
    const applicant = this.data.record.applicants[index];
    if (!applicant) return;

    try {
      const confirmed = await new Promise(resolve => {
        wx.showModal({
          title: '确认选择',
          content: `确定选择该志愿者吗？`,
          success: (res) => resolve(res.confirm)
        });
      });
      if (!confirmed) return;

      wx.showLoading({ title: '操作中...' });
      await api.assignVolunteer(this.data.record.id, applicant.volunteerId);
      wx.hideLoading();
      const record = { ...this.data.record, status: 'in_progress', volunteer: { ...applicant } };
      this.setData({ record });
      wx.showToast({ title: '已选择志愿者', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  }
});
```

---

### Task 11: 对接评价 `pages/review/review.js`

**Files:**
- Modify: `pages/review/review.js`

- [ ] **重写 submitReview — 调用评价 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    rating: 0,
    comment: '',
    recordId: '',
    taskId: '',
    toUserId: ''
  },

  onLoad(options) {
    this.setData({
      recordId: options.recordId || '',
      taskId: options.taskId || '',
      toUserId: options.toUserId || ''
    });
  },

  goBack() { wx.navigateBack(); },

  setRating(e) {
    const star = parseInt(e.currentTarget.dataset.star);
    this.setData({ rating: star });
  },

  onCommentInput(e) { this.setData({ comment: e.detail.value }); },

  async submitReview() {
    const { rating, recordId, taskId, toUserId } = this.data;
    if (!rating) {
      wx.showToast({ title: '请给个评分', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '提交中...' });
      await api.reviewRecord(recordId, taskId, toUserId, rating, this.data.comment);
      wx.hideLoading();
      wx.showToast({ title: '评价成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '评价失败', icon: 'none' });
    }
  }
});
```

---

### Task 12: 对接健康记录 `pages/health/health.js`

**Files:**
- Modify: `pages/health/health.js`

- [ ] **重写 health.js — 调用健康记录 API**

```javascript
const api = require('../../utils/api');

Page({
  async onShow() {
    await this.loadRecords();
  },

  async loadRecords() {
    try {
      const records = await api.getHealthRecords();
      // 数据交给 WXML 渲染
      this.setData({ records: records || [] });
    } catch (e) {
      console.error('加载健康记录失败', e);
    }
  },

  goBack() { wx.navigateBack(); },

  handleUpload() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: async (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        try {
          wx.showLoading({ title: '上传中...' });
          await api.createHealthRecord(tempPath, '');
          wx.hideLoading();
          wx.showToast({ title: '上传成功', icon: 'success' });
          await this.loadRecords();
        } catch (e) {
          wx.hideLoading();
          wx.showToast({ title: e.message || '上传失败', icon: 'none' });
        }
      }
    });
  }
});
```

---

### Task 13: 对接个人资料 `pages/edit_profile/edit_profile.js`

**Files:**
- Modify: `pages/edit_profile/edit_profile.js`

- [ ] **重写 edit_profile.js — 加载和保存调用 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    name: '',
    phone: ''
  },

  async onLoad() {
    try {
      const profile = await api.getProfile();
      this.setData({
        name: profile.name || '',
        phone: profile.phone || ''
      });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },

  async handleSave() {
    const { name, phone } = this.data;
    if (!name) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '保存中...' });
      await api.updateProfile({ name, phone });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
```

---

### Task 14: 对接修改密码 `pages/change_password/change_password.js`

**Files:**
- Modify: `pages/change_password/change_password.js`

- [ ] **重写 handleChange — 调用修改密码 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  goBack() { wx.navigateBack(); },
  onOldInput(e) { this.setData({ oldPassword: e.detail.value }); },
  onNewInput(e) { this.setData({ newPassword: e.detail.value }); },
  onConfirmInput(e) { this.setData({ confirmPassword: e.detail.value }); },

  async handleChange() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    if (!oldPassword || !newPassword) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '修改中...' });
      await api.changePassword(oldPassword, newPassword);
      wx.hideLoading();
      wx.showToast({ title: '密码修改成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '修改失败', icon: 'none' });
    }
  }
});
```

---

### Task 15: 对接实名认证 `pages/realname_auth/realname_auth.js`

**Files:**
- Modify: `pages/realname_auth/realname_auth.js`

- [ ] **重写 handleSubmit — 调用实名认证 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    frontImage: '',
    backImage: '',
    realName: '',
    idCard: ''
  },

  uploadFront() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => { this.setData({ frontImage: res.tempFiles[0].tempFilePath }); }
    });
  },

  uploadBack() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => { this.setData({ backImage: res.tempFiles[0].tempFilePath }); }
    });
  },

  goBack() { wx.navigateBack(); },

  onNameInput(e) { this.setData({ realName: e.detail.value }); },
  onIdCardInput(e) { this.setData({ idCard: e.detail.value }); },

  async handleSubmit() {
    const { realName, idCard } = this.data;
    if (!realName || !idCard) {
      wx.showToast({ title: '请填写姓名和身份证号', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '提交中...' });
      await api.realnameAuth(realName, idCard);
      wx.hideLoading();
      wx.showToast({ title: '认证成功', icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: '/pages/home/home' }), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '认证失败', icon: 'none' });
    }
  }
});
```

---

### Task 16: 对接地址列表 `pages/address_book/address_book.js`

**Files:**
- Modify: `pages/address_book/address_book.js`

- [ ] **重写 address_book.js — 从 API 加载地址列表**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    addressList: []
  },

  async onShow() {
    try {
      const list = await api.getAddresses();
      this.setData({ addressList: list || [] });
    } catch (e) {
      wx.showToast({ title: e.message, icon: 'none' });
    }
  },

  goBack() { wx.navigateBack(); },

  goAddAddress() {
    wx.navigateTo({ url: '/pages/add_address/add_address' });
  }
});
```

---

### Task 17: 对接新增地址 `pages/add_address/add_address.js`

**Files:**
- Modify: `pages/add_address/add_address.js`

- [ ] **重写 handleSave — 调用新增地址 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    name: '',
    detail: ''
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onDetailInput(e) { this.setData({ detail: e.detail.value }); },

  async handleSave() {
    const { name, detail } = this.data;
    if (!name || !detail) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '保存中...' });
      await api.createAddress({ name, phone: '', address: detail, isDefault: false });
      wx.hideLoading();
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '保存失败', icon: 'none' });
    }
  }
});
```

---

### Task 18: 对接绑定家属 `pages/bind_family/bind_family.js`

**Files:**
- Modify: `pages/bind_family/bind_family.js`

- [ ] **重写 bind_family.js — 加载和绑定调用 API**

```javascript
const api = require('../../utils/api');

Page({
  data: {
    name: '',
    phone: '',
    familyList: []
  },

  async onShow() {
    await this.loadFamily();
  },

  async loadFamily() {
    try {
      const list = await api.getFamilyBindings();
      this.setData({ familyList: list || [] });
    } catch (e) {
      console.error('加载家属列表失败', e);
    }
  },

  goBack() { wx.navigateBack(); },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },

  async handleBind() {
    const { name, phone } = this.data;
    if (!name || !phone) {
      wx.showToast({ title: '请填写完整', icon: 'none' });
      return;
    }
    try {
      wx.showLoading({ title: '绑定中...' });
      await api.createFamilyBinding(name, phone);
      wx.hideLoading();
      wx.showToast({ title: '绑定成功', icon: 'success' });
      this.setData({ name: '', phone: '' });
      await this.loadFamily();
      setTimeout(() => wx.navigateBack(), 1000);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: e.message || '绑定失败', icon: 'none' });
    }
  }
});
```
