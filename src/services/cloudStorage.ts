import { FilterModel } from '../types';

export type CloudDataV1 = {
  version: 1;
  filters: FilterModel[];
  title?: string;
};

const TEXTDB_API_URL = 'https://textdb.online/update/';
const TEXTDB_READ_URL = 'https://textdb.online/';

/**
 * TextDB.online 云存储服务
 * 用于跨设备同步滤芯数据
 */
export class CloudStorageService {
  /**
   * 从云端加载滤芯数据
   * @param key 云端数据的唯一标识符(6-60位字符,建议20位以上)
   * @returns 加载的滤芯数组,如果数据不存在则返回 null
   */
  static async loadFilters(key: string): Promise<FilterModel[] | null> {
    try {
      // 完全不指定 method,让浏览器使用默认 GET,避免任何预检请求
      const response = await fetch(`${TEXTDB_READ_URL}${key}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      // 如果返回空内容,说明记录不存在
      if (!text || text.trim() === '') {
        return null;
      }

      // 兼容两种格式：
      // 1) 旧格式：直接是 FilterModel[]
      // 2) 新格式：{ version:1, filters:[], title?: string }
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed as FilterModel[];
      }
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.filters)) {
        return parsed.filters as FilterModel[];
      }
      return null;
    } catch (error) {
      console.error('从云端加载数据失败:', error);
      // 如果是解析错误或网络错误,返回 null 而不是抛出异常
      return null;
    }
  }

  /**
   * 从云端加载完整数据（含标题）
   */
  static async loadData(key: string): Promise<CloudDataV1 | null> {
    try {
      const response = await fetch(`${TEXTDB_READ_URL}${key}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      if (!text || text.trim() === '') return null;
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return { version: 1, filters: parsed as FilterModel[] };
      }
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.filters)) {
        return { version: 1, filters: parsed.filters as FilterModel[], title: parsed.title };
      }
      return null;
    } catch (e) {
      console.error('从云端加载完整数据失败:', e);
      return null;
    }
  }

  /**
   * 保存滤芯数据到云端
   * @param key 云端数据的唯一标识符(6-60位字符,建议20位以上)
   * @param filters 要保存的滤芯数组
   * @returns 保存结果,包含状态和URL
   */
  static async saveFilters(
    key: string,
    filters: FilterModel[]
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const value = JSON.stringify(filters);
      
      // 使用 GET 方法避免 CORS 预检
      // 对 value 进行 URL 编码
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      const url = `${TEXTDB_API_URL}?key=${encodedKey}&value=${encodedValue}`;

      // 完全不指定 method,让浏览器使用默认 GET,避免任何预检请求
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 1) {
        return {
          success: true,
          url: result.data?.url,
        };
      } else {
        return {
          success: false,
          error: '保存失败',
        };
      }
    } catch (error) {
      console.error('保存数据到云端失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 保存完整数据（含标题）到云端，向后兼容 textdb 存储
   */
  static async saveData(
    key: string,
    data: CloudDataV1
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const value = JSON.stringify(data);
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      const url = `${TEXTDB_API_URL}?key=${encodedKey}&value=${encodedValue}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 1) {
        return { success: true, url: result.data?.url };
      }
      return { success: false, error: '保存失败' };
    } catch (error) {
      console.error('保存完整数据到云端失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知错误' };
    }
  }

  /**
   * 删除云端数据
   * @param key 云端数据的唯一标识符
   * @returns 删除是否成功
   */
  static async clearAll(key: string): Promise<boolean> {
    try {
      // 使用 GET 方法避免 CORS 预检
      // value 为空表示删除
      const encodedKey = encodeURIComponent(key);
      const url = `${TEXTDB_API_URL}?key=${encodedKey}&value=`;

      // 完全不指定 method,让浏览器使用默认 GET,避免任何预检请求
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.status === 1;
    } catch (error) {
      console.error('删除云端数据失败:', error);
      return false;
    }
  }

  /**
   * 生成随机的云端存储 key (20位字符)
   * @returns 随机生成的 key
   */
  static generateKey(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
    let key = 'purifier_'; // 添加前缀以标识用途
    for (let i = 0; i < 20; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  /**
   * 验证 key 格式是否有效
   * @param key 要验证的 key
   * @returns 是否有效
   */
  static isValidKey(key: string): boolean {
    // key 长度为 6-60 位,仅支持 0-9a-zA-Z-_
    const keyRegex = /^[0-9a-zA-Z\-_]{6,60}$/;
    return keyRegex.test(key);
  }
}
