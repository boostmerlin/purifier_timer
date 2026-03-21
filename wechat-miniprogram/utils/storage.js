const STORAGE_KEY = '@purifier_filters';
const CLOUD_KEY_STORAGE = '@purifier_cloud_key';
const TITLE_KEY = '@purifier_title';

function safeParseArray(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('解析本地滤芯数据失败:', error);
    return null;
  }
}

const StorageService = {
  loadFilters() {
    try {
      const raw = wx.getStorageSync(STORAGE_KEY);
      return safeParseArray(raw);
    } catch (error) {
      console.error('读取本地滤芯失败:', error);
      return null;
    }
  },

  saveFilters(filters) {
    try {
      wx.setStorageSync(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('保存本地滤芯失败:', error);
      throw error;
    }
  },

  getCloudKey() {
    try {
      const value = wx.getStorageSync(CLOUD_KEY_STORAGE);
      return value || null;
    } catch (error) {
      console.error('读取云端 key 失败:', error);
      return null;
    }
  },

  saveCloudKey(key) {
    try {
      wx.setStorageSync(CLOUD_KEY_STORAGE, key);
    } catch (error) {
      console.error('保存云端 key 失败:', error);
      throw error;
    }
  },

  clearCloudKey() {
    try {
      wx.removeStorageSync(CLOUD_KEY_STORAGE);
    } catch (error) {
      console.error('清除云端 key 失败:', error);
    }
  },

  getTitle() {
    try {
      const value = wx.getStorageSync(TITLE_KEY);
      return value || null;
    } catch (error) {
      console.error('读取标题失败:', error);
      return null;
    }
  },

  saveTitle(title) {
    try {
      wx.setStorageSync(TITLE_KEY, title);
    } catch (error) {
      console.error('保存标题失败:', error);
      throw error;
    }
  },

  getDefaultFilters() {
    const now = Date.now();
    return [
      { letter: 'A', startedAt: now, lifespanDays: 30 * 4, label: 'PPF棉' },
      { letter: 'B', startedAt: now, lifespanDays: 30 * 8, label: 'CTO活性炭' },
      { letter: 'C', startedAt: now, lifespanDays: 30 * 4, label: 'PPF棉' },
      { letter: 'D', startedAt: now, lifespanDays: 30 * 16, label: 'UF膜' },
      { letter: 'E', startedAt: now, lifespanDays: 30 * 8, label: 'T33后置活性炭' },
    ];
  },
};

module.exports = {
  STORAGE_KEY,
  CLOUD_KEY_STORAGE,
  TITLE_KEY,
  StorageService,
};
