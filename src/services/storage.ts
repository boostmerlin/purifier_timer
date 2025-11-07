import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterModel } from '../types';

const STORAGE_KEY = '@purifier_filters';
const CLOUD_KEY_STORAGE = '@purifier_cloud_key'; // 存储云端 key
const TITLE_KEY = '@purifier_title'; // 存储机型/标题

/**
 * 数据存储服务
 * 负责处理所有与 AsyncStorage 相关的持久化操作
 */
export class StorageService {
  /**
   * 从 AsyncStorage 加载滤芯数据
   * @returns 加载的滤芯数组,如果没有数据则返回 null
   */
  static async loadFilters(): Promise<FilterModel[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as FilterModel[];
      }
      return null;
    } catch (error) {
      console.error('加载数据失败:', error);
      throw new Error('加载数据失败');
    }
  }

  /**
   * 保存滤芯数据到 AsyncStorage
   * @param filters 要保存的滤芯数组
   */
  static async saveFilters(filters: FilterModel[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('保存数据失败:', error);
      throw new Error('保存数据失败');
    }
  }

  /**
   * 删除所有存储的数据(重置)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清除数据失败:', error);
      throw new Error('清除数据失败');
    }
  }

  /**
   * 保存云端同步 key
   * @param key 云端 key
   */
  static async saveCloudKey(key: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CLOUD_KEY_STORAGE, key);
    } catch (error) {
      console.error('保存云端 key 失败:', error);
      throw new Error('保存云端 key 失败');
    }
  }

  /**
   * 获取云端同步 key
   * @returns 云端 key,如果不存在则返回 null
   */
  static async getCloudKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(CLOUD_KEY_STORAGE);
    } catch (error) {
      console.error('获取云端 key 失败:', error);
      return null;
    }
  }

  /**
   * 删除云端同步 key
   */
  static async clearCloudKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CLOUD_KEY_STORAGE);
    } catch (error) {
      console.error('删除云端 key 失败:', error);
    }
  }

  /**
   * 保存机身标题（例如“长虹H502”）
   */
  static async saveTitle(title: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TITLE_KEY, title);
    } catch (error) {
      console.error('保存标题失败:', error);
      throw new Error('保存标题失败');
    }
  }

  /**
   * 获取机身标题
   */
  static async getTitle(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TITLE_KEY);
    } catch (error) {
      console.error('获取标题失败:', error);
      return null;
    }
  }

  /**
   * 获取默认的滤芯数据, 长虹H501,502型号
   * @returns 默认的滤芯数组
   */
  static getDefaultFilters(): FilterModel[] {
    const now = Date.now();
    return [
      { 
        letter: 'A', 
        startedAt: now, 
        lifespanDays: 30*4, //3-6个月更换
        label: 'PPF棉' 
      },
      { 
        letter: 'B', 
        startedAt: now, 
        lifespanDays: 30*8, //6-10个月更换
        label: 'CTO活性炭' 
      },
      { 
        letter: 'C', 
        startedAt: now, 
        lifespanDays: 30*4, //3-6个月更换
        label: 'PPF棉' 
      },
      {
        letter: 'D',
        startedAt: now,
        lifespanDays: 30*16, //12-24个月更换
        label: 'UF膜'
      },
      {
        letter: 'E',
        startedAt: now,
        lifespanDays: 30*8, //6-10个月更换
        label: 'T33后置活性炭'
      }
    ];
  }
}
