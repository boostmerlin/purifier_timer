import { useState, useEffect, useCallback } from 'react';
import { FilterModel, FilterLetter } from '../types';
import { StorageService } from '../services/storage';
import { CloudStorageService } from '../services/cloudStorage';
import { nextLetter } from '../utils/filters';

/**
 * 自定义 Hook: 管理滤芯数据的状态和持久化
 * @returns 滤芯数据和操作方法
 */
export function useFilters() {
  const [filters, setFilters] = useState<FilterModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudKey, setCloudKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // 初始化数据：从云端或本地存储加载
  useEffect(() => {
    const initializeFilters = async () => {
      try {
        // 先尝试获取云端 key
        const savedCloudKey = await StorageService.getCloudKey();
        
        if (savedCloudKey) {
          setCloudKey(savedCloudKey);
          // 如果有云端 key,优先从云端加载
          const cloudData = await CloudStorageService.loadFilters(savedCloudKey);
          if (cloudData && cloudData.length > 0) {
            setFilters(cloudData);
            // 同时保存到本地作为缓存
            await StorageService.saveFilters(cloudData);
            setLastSyncTime(new Date());
            return;
          }
        }

        // 如果云端没有数据,从本地加载
        const localData = await StorageService.loadFilters();
        if (localData) {
          setFilters(localData);
        } else {
          // 首次使用,设置默认数据
          const defaultFilters = StorageService.getDefaultFilters();
          setFilters(defaultFilters);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
        setFilters([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFilters();
  }, []);

  // 每次 filters 变化时自动保存到本地和云端
  useEffect(() => {
    if (!isLoading && filters.length >= 0) {
      // 保存到本地
      StorageService.saveFilters(filters).catch((error) => {
        console.error('自动保存到本地失败:', error);
      });

      // 如果有云端 key,同步到云端
      if (cloudKey) {
        syncToCloud(filters);
      }
    }
  }, [filters, isLoading, cloudKey]);

  /**
   * 同步数据到云端
   */
  const syncToCloud = async (data: FilterModel[]) => {
    if (!cloudKey || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await CloudStorageService.saveFilters(cloudKey, data);
      if (result.success) {
        setLastSyncTime(new Date());
      } else {
        console.error('云端同步失败:', result.error);
      }
    } catch (error) {
      console.error('云端同步异常:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 从云端拉取最新数据
   */
  const pullFromCloud = useCallback(async () => {
    if (!cloudKey) {
      throw new Error('未设置云端同步 key');
    }

    setIsSyncing(true);
    try {
      const cloudData = await CloudStorageService.loadFilters(cloudKey);
      if (cloudData) {
        setFilters(cloudData);
        await StorageService.saveFilters(cloudData);
        setLastSyncTime(new Date());
        return true;
      }
      return false;
    } catch (error) {
      console.error('从云端拉取数据失败:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [cloudKey]);

  /**
   * 启用云端同步
   * @param key 可选,提供已有的 key 或自动生成新 key
   */
  const enableCloudSync = useCallback(async (key?: string) => {
    try {
      const syncKey = key || CloudStorageService.generateKey();
      
      // 验证 key 格式
      if (!CloudStorageService.isValidKey(syncKey)) {
        throw new Error('无效的云端 key 格式');
      }

      // 保存当前数据到云端
      const result = await CloudStorageService.saveFilters(syncKey, filters);
      if (!result.success) {
        throw new Error(result.error || '启用云端同步失败');
      }

      // 保存 key 到本地
      await StorageService.saveCloudKey(syncKey);
      setCloudKey(syncKey);
      setLastSyncTime(new Date());

      return syncKey;
    } catch (error) {
      console.error('启用云端同步失败:', error);
      throw error;
    }
  }, [filters]);

  /**
   * 禁用云端同步
   */
  const disableCloudSync = useCallback(async () => {
    try {
      await StorageService.clearCloudKey();
      setCloudKey(null);
      setLastSyncTime(null);
    } catch (error) {
      console.error('禁用云端同步失败:', error);
      throw error;
    }
  }, []);

  /**
   * 添加新滤芯
   */
  const addFilter = () => {
    try {
      const letter = nextLetter(filters.map((f) => f.letter));
      const now = Date.now();
      setFilters((prev) => [
        ...prev,
        { letter: letter as FilterLetter, startedAt: now, lifespanDays: 180 },
      ]);
    } catch (e) {
      console.warn('添加滤芯失败:', String(e));
      throw e;
    }
  };

  /**
   * 删除最后一个滤芯
   */
  const removeLastFilter = () => {
    setFilters((prev) => prev.slice(0, -1));
  };

  /**
   * 删除指定的滤芯
   * @param filterId 滤芯的 letter 标识
   */
  const deleteFilter = (filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.letter !== filterId));
  };

  /**
   * 更新滤芯数据
   * @param updated 更新后的滤芯数据
   */
  const updateFilter = (updated: FilterModel) => {
    setFilters((prev) =>
      prev.map((f) => (f.letter === updated.letter ? updated : f))
    );
  };

  /**
   * 重置所有数据,恢复为默认滤芯
   */
  const resetAll = async () => {
    try {
      await StorageService.clearAll();
      // 重置后加载默认数据
      const defaultFilters = StorageService.getDefaultFilters();
      setFilters(defaultFilters);
    } catch (error) {
      console.error('重置失败:', error);
      throw error;
    }
  };

  return {
    filters,
    isLoading,
    cloudKey,
    isSyncing,
    lastSyncTime,
    addFilter,
    removeLastFilter,
    deleteFilter,
    updateFilter,
    resetAll,
    enableCloudSync,
    disableCloudSync,
    pullFromCloud,
  };
}

