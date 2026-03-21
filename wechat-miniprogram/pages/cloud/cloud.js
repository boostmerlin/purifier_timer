const app = getApp();

function formatSyncTime(timestamp) {
  if (!timestamp) return '从未同步';
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

Page({
  data: {
    cloudKey: null,
    isSyncing: false,
    lastSyncLabel: '从未同步',
    inputKey: '',
  },

  onShow() {
    this.refreshState();
  },

  refreshState() {
    this.setData({
      cloudKey: app.globalData.cloudKey,
      isSyncing: app.globalData.isSyncing,
      lastSyncLabel: formatSyncTime(app.globalData.lastSyncTime),
    });
  },

  onInputKey(e) {
    this.setData({ inputKey: (e.detail.value || '').trim() });
  },

  async enableWithNewKey() {
    wx.showLoading({ title: '启用中...' });
    try {
      const key = await app.enableCloudSync();
      this.refreshState();
      wx.hideLoading();
      wx.showModal({
        title: '云端同步已启用',
        content: `同步密钥:\n${key}\n\n请妥善保管，在其他设备使用相同密钥即可同步数据。`,
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制密钥',
        success: (res) => {
          if (res.confirm) {
            wx.setClipboardData({ data: key });
          }
        },
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '启用失败', icon: 'none' });
    }
  },

  connectExistingKey() {
    const key = this.data.inputKey;
    if (!key) {
      wx.showToast({ title: '请输入同步密钥', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认覆盖',
      content: '即将使用云端数据覆盖本地，是否继续？',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '连接中...' });
        try {
          await app.enableCloudSync(key);
          this.setData({ inputKey: '' });
          this.refreshState();
          wx.hideLoading();
          wx.showToast({ title: '连接成功', icon: 'success' });
        } catch (error) {
          wx.hideLoading();
          wx.showToast({ title: error.message || '连接失败', icon: 'none' });
        }
      },
    });
  },

  async pullFromCloud() {
    wx.showLoading({ title: '拉取中...' });
    try {
      const success = await app.pullFromCloud();
      this.refreshState();
      wx.hideLoading();
      if (success) {
        wx.showToast({ title: '拉取成功', icon: 'success' });
      } else {
        wx.showToast({ title: '云端暂无数据', icon: 'none' });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '拉取失败', icon: 'none' });
    }
  },

  disableCloudSync() {
    wx.showModal({
      title: '确认禁用',
      content: '禁用云端同步后数据将只保存在本地，云端数据不会删除。',
      confirmColor: '#dc2626',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await app.disableCloudSync();
          this.refreshState();
          wx.showToast({ title: '已禁用', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: '禁用失败', icon: 'none' });
        }
      },
    });
  },

  copyCloudKey() {
    if (!this.data.cloudKey) return;
    wx.setClipboardData({
      data: this.data.cloudKey,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' });
      },
    });
  },

  confirmResetAll() {
    wx.showModal({
      title: '确认重置',
      content: '确定要删除所有滤芯数据吗？此操作无法撤销。',
      confirmColor: '#dc2626',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await app.resetAll();
          wx.showToast({ title: '重置成功', icon: 'success' });
        } catch (error) {
          wx.showToast({ title: '重置失败', icon: 'none' });
        }
      },
    });
  },
});
