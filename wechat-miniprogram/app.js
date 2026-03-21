const { StorageService } = require('./utils/storage');
const { CloudService } = require('./utils/cloud');
const { nextLetter } = require('./utils/filters');

App({
  globalData: {
    filters: [],
    cloudKey: null,
    isSyncing: false,
    lastSyncTime: null,
    unitTitle: '长虹H502',
  },

  onLaunch() {
    this.initialize().catch((error) => {
      console.error('初始化失败:', error);
      this.globalData.filters = StorageService.getDefaultFilters();
    });
  },

  async initialize() {
    const savedCloudKey = StorageService.getCloudKey();
    const savedTitle = StorageService.getTitle();

    if (savedTitle) {
      this.globalData.unitTitle = savedTitle;
    }

    if (savedCloudKey) {
      this.globalData.cloudKey = savedCloudKey;
      const cloudData = await CloudService.loadData(savedCloudKey);
      if (cloudData && Array.isArray(cloudData.filters) && cloudData.filters.length > 0) {
        this.globalData.filters = cloudData.filters;
        StorageService.saveFilters(cloudData.filters);
        if (cloudData.title) {
          this.globalData.unitTitle = cloudData.title;
          StorageService.saveTitle(cloudData.title);
        }
        this.globalData.lastSyncTime = Date.now();
        return;
      }
    }

    const localFilters = StorageService.loadFilters();
    if (localFilters && localFilters.length > 0) {
      this.globalData.filters = localFilters;
    } else {
      this.globalData.filters = StorageService.getDefaultFilters();
      StorageService.saveFilters(this.globalData.filters);
    }
  },

  persistFilters(filters) {
    this.globalData.filters = filters;
    StorageService.saveFilters(filters);
  },

  async maybeSyncToCloud(filters) {
    if (!this.globalData.cloudKey || this.globalData.isSyncing) {
      return;
    }
    await this.syncToCloud(filters);
  },

  async syncToCloud(data) {
    if (!this.globalData.cloudKey || this.globalData.isSyncing) {
      return;
    }

    this.globalData.isSyncing = true;
    try {
      const payload = {
        version: 1,
        filters: data || this.globalData.filters,
        title: this.globalData.unitTitle || undefined,
      };
      const result = await CloudService.saveData(this.globalData.cloudKey, payload);
      if (result.success) {
        this.globalData.lastSyncTime = Date.now();
      } else {
        console.error('云端同步失败:', result.error || '未知错误');
      }
    } catch (error) {
      console.error('云端同步异常:', error);
    } finally {
      this.globalData.isSyncing = false;
    }
  },

  async pullFromCloud() {
    if (!this.globalData.cloudKey) {
      throw new Error('未设置云端同步 key');
    }

    this.globalData.isSyncing = true;
    try {
      const cloudData = await CloudService.loadData(this.globalData.cloudKey);
      if (!cloudData) {
        return false;
      }

      const cloudFilters = Array.isArray(cloudData.filters) ? cloudData.filters : [];
      this.globalData.filters = cloudFilters;
      StorageService.saveFilters(cloudFilters);

      if (cloudData.title) {
        this.globalData.unitTitle = cloudData.title;
        StorageService.saveTitle(cloudData.title);
      }

      this.globalData.lastSyncTime = Date.now();
      return true;
    } catch (error) {
      console.error('从云端拉取数据失败:', error);
      throw error;
    } finally {
      this.globalData.isSyncing = false;
    }
  },

  async enableCloudSync(key) {
    const syncKey = key || CloudService.generateKey();
    if (!CloudService.isValidKey(syncKey)) {
      throw new Error('无效的云端 key 格式');
    }

    if (key) {
      const cloudData = await CloudService.loadData(syncKey);
      if (cloudData && Array.isArray(cloudData.filters) && cloudData.filters.length > 0) {
        this.globalData.filters = cloudData.filters;
        StorageService.saveFilters(cloudData.filters);
        if (cloudData.title) {
          this.globalData.unitTitle = cloudData.title;
          StorageService.saveTitle(cloudData.title);
        }
        this.globalData.cloudKey = syncKey;
        StorageService.saveCloudKey(syncKey);
        this.globalData.lastSyncTime = Date.now();
        return syncKey;
      }
    }

    const uploadResult = await CloudService.saveData(syncKey, {
      version: 1,
      filters: this.globalData.filters,
      title: this.globalData.unitTitle || undefined,
    });
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || '启用云端同步失败');
    }

    this.globalData.cloudKey = syncKey;
    StorageService.saveCloudKey(syncKey);
    this.globalData.lastSyncTime = Date.now();
    return syncKey;
  },

  async disableCloudSync() {
    StorageService.clearCloudKey();
    this.globalData.cloudKey = null;
    this.globalData.lastSyncTime = null;
  },

  async setTitle(title) {
    this.globalData.unitTitle = title;
    StorageService.saveTitle(title);
    await this.maybeSyncToCloud(this.globalData.filters);
  },

  async addFilter() {
    const letter = nextLetter(this.globalData.filters.map((f) => f.letter));
    const now = Date.now();
    const nextFilters = this.globalData.filters.concat([
      {
        letter,
        startedAt: now,
        lifespanDays: 180,
      },
    ]);
    this.persistFilters(nextFilters);
    await this.maybeSyncToCloud(nextFilters);
    return letter;
  },

  async removeLastFilter() {
    const nextFilters = this.globalData.filters.slice(0, -1);
    this.persistFilters(nextFilters);
    await this.maybeSyncToCloud(nextFilters);
  },

  async deleteFilter(letter) {
    const nextFilters = this.globalData.filters.filter((f) => f.letter !== letter);
    this.persistFilters(nextFilters);
    await this.maybeSyncToCloud(nextFilters);
  },

  async updateFilter(updated) {
    const nextFilters = this.globalData.filters.map((f) =>
      f.letter === updated.letter ? updated : f
    );
    this.persistFilters(nextFilters);
    await this.maybeSyncToCloud(nextFilters);
  },

  async resetAll() {
    const defaults = StorageService.getDefaultFilters();
    this.persistFilters(defaults);
    await this.maybeSyncToCloud(defaults);
  },
});
