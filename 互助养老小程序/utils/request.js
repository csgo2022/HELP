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

function uploadFile(url, filePath, name) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const header = {};
    if (token) header['Authorization'] = `Bearer ${token}`;

    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}${url}`,
      filePath,
      name: name || 'file',
      header,
      success(res) {
        try {
          const body = JSON.parse(res.data);
          if (body.code === 200) {
            resolve(body.data);
          } else if (body.code === 401) {
            wx.removeStorageSync('token');
            wx.removeStorageSync('user');
            wx.reLaunch({ url: '/pages/login/login' });
            reject(new Error(body.message || '登录已过期'));
          } else {
            reject(new Error(body.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('上传响应解析失败'));
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
  del(url) { return request('DELETE', url); },
  uploadFile(url, filePath, name) { return uploadFile(url, filePath, name); }
};
