const TEXTDB_API_URL = 'https://textdb.online/update/';
const TEXTDB_READ_URL = 'https://textdb.online/';

function request(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      },
      fail: (error) => reject(error),
    });
  });
}

function normalizeCloudData(input) {
  let parsed = input;

  if (typeof parsed === 'string') {
    if (!parsed.trim()) {
      return null;
    }
    try {
      parsed = JSON.parse(parsed);
    } catch (error) {
      return null;
    }
  }

  if (Array.isArray(parsed)) {
    return {
      version: 1,
      filters: parsed,
    };
  }

  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.filters)) {
    return {
      version: 1,
      filters: parsed.filters,
      title: parsed.title,
    };
  }

  return null;
}

const CloudService = {
  async loadData(key) {
    try {
      const encodedKey = encodeURIComponent(key);
      const result = await request(`${TEXTDB_READ_URL}${encodedKey}`);
      return normalizeCloudData(result);
    } catch (error) {
      console.error('从云端加载失败:', error);
      return null;
    }
  },

  async saveData(key, data) {
    try {
      const value = JSON.stringify(data);
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      const url = `${TEXTDB_API_URL}?key=${encodedKey}&value=${encodedValue}`;
      const result = await request(url);

      if (result && result.status === 1) {
        return {
          success: true,
          url: result.data && result.data.url ? result.data.url : undefined,
        };
      }

      return {
        success: false,
        error: '保存失败',
      };
    } catch (error) {
      console.error('保存到云端失败:', error);
      return {
        success: false,
        error: error && error.message ? error.message : '未知错误',
      };
    }
  },

  generateKey() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
    let key = 'purifier_';
    for (let i = 0; i < 20; i += 1) {
      const index = Math.floor(Math.random() * chars.length);
      key += chars.charAt(index);
    }
    return key;
  },

  isValidKey(key) {
    return /^[0-9a-zA-Z\-_]{6,60}$/.test(key);
  },
};

module.exports = {
  CloudService,
  request,
};
