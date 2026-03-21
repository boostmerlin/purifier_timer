# 净水器滤芯计时器 - 产品需求文档 (PRD)

## 1. 文档概述

### 1.1 产品信息
- **产品名称**: 净水器滤芯计时器 (Purifier Timer)
- **版本**: 1.0.0
- **产品类型**: 跨平台工具类应用
- **目标平台**: iOS、Android、Web

### 1.2 文档目的
本文档详细描述净水器滤芯计时器应用的功能需求、技术架构和实现细节，为开发团队和维护人员提供参考依据。

---

## 2. 产品概述

### 2.1 产品定位
一款用于跟踪和管理净水器滤芯使用寿命的跨平台工具应用，帮助用户及时了解滤芯状态，提醒更换，确保饮水安全。

### 2.2 目标用户
- 家庭用户：管理家用净水器的多个滤芯
- 商业用户：管理商用净水设备的滤芯维护
- 需要多设备同步数据的用户

### 2.3 核心价值
- **可视化监控**: 直观显示每个滤芯的剩余寿命
- **智能提醒**: 自动计算并显示剩余天数
- **云端同步**: 支持多设备数据同步
- **灵活配置**: 支持自定义滤芯参数

---

## 3. 功能需求

### 3.1 功能架构图
```
净水器滤芯计时器
├── 滤芯管理
│   ├── 滤芯列表显示
│   ├── 添加新滤芯
│   ├── 删除滤芯
│   ├── 编辑滤芯
│   └── 重置所有数据
├── 进度展示
│   ├── 进度百分比
│   ├── 剩余天数
│   ├── 颜色状态指示
│   └── 动态水流效果
├── 数据持久化
│   ├── 本地存储
│   └── 云端同步
└── 交互功能
    ├── 长按编辑
    ├── 点击切换显示
    └── 锁屏保护
```

### 3.2 详细功能说明

#### 3.2.1 滤芯列表显示
| 功能项 | 描述 |
|--------|------|
| 显示内容 | 滤芯标签、进度百分比/剩余天数、字母标识 (A-Z) |
| 布局方式 | 响应式网格布局，自适应屏幕宽度 |
| 视觉效果 | 绿色→红色渐变进度条，动态水流动画 |
| 交互方式 | 单击切换百分比/天数显示，长按弹出操作菜单 |

#### 3.2.2 滤芯管理
| 操作 | 说明 |
|------|------|
| 添加滤芯 | 点击"+"按钮添加新滤芯，按 A-Z 顺序分配标识 |
| 删除滤芯 | 长按滤芯→选择"删除"→确认删除 |
| 编辑滤芯 | 长按滤芯→选择"编辑"，可修改名称、寿命天数、启用日期 |
| 删除最后一个 | 点击"-"按钮删除最后一个滤芯（需解锁状态） |
| 重置所有 | 点击"重置存档"→确认，恢复为默认 5 个滤芯配置 |

#### 3.2.3 进度计算
- **进度公式**: `progress = remainingDays / lifespanDays`
- **颜色映射**: 进度 100% 显示绿色 (#2ecc71)，进度 0% 显示红色 (#e74c3c)
- **自动刷新**: 每小时自动更新进度显示
- **剩余天数**: `remainingDays = max(0, lifespanDays - usedDays)`

#### 3.2.4 云端同步
| 功能 | 描述 |
|------|------|
| 启用同步 | 生成新密钥或使用已有密钥 |
| 数据上传 | 自动同步滤芯数据到云端 (TextDB.online) |
| 数据下载 | 从云端拉取最新数据到本地 |
| 跨设备同步 | 使用相同密钥在多设备间同步数据 |
| 禁用同步 | 关闭云端同步，数据仅保存在本地 |

### 3.3 默认滤芯配置
| 标识 | 名称 | 寿命 (天) | 说明 |
|------|------|-----------|------|
| A | PPF 棉 | 90 (30×4) | 3-6 个月更换 |
| B | CTO 活性炭 | 240 (30×8) | 6-10 个月更换 |
| C | PPF 棉 | 90 (30×4) | 3-6 个月更换 |
| D | UF 膜 | 480 (30×16) | 12-24 个月更换 |
| E | T33 后置活性炭 | 240 (30×8) | 6-10 个月更换 |

---

## 4. 技术架构

### 4.1 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.81.4 | 跨平台 UI 框架 |
| Expo | ~54.0.18 | 开发平台和构建工具 |
| React | 19.1.0 | UI 组件库 |
| TypeScript | ~5.9.2 | 类型系统 |
| AsyncStorage | 2.2.0 | 本地数据存储 |

### 4.2 项目结构
```
purifier-timer/
├── App.tsx                     # 主应用入口
├── index.ts                    # 应用启动入口
├── package.json                # 项目配置
├── app.json                    # Expo 配置
├── tsconfig.json               # TypeScript 配置
├── assets/                     # 静态资源
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── src/
    ├── components/             # UI 组件
    │   ├── AlertDialog.tsx     # 提示对话框
    │   ├── CloudSyncModal.tsx  # 云端同步模态框
    │   ├── ConfirmDialog.tsx   # 确认对话框
    │   ├── ContextMenu.tsx     # 上下文菜单
    │   ├── FilterCapsule.tsx   # 滤芯胶囊组件
    │   ├── FilterEditModal.tsx # 滤芯编辑模态框
    │   └── PurifierUnit.tsx    # 净水器主体组件
    ├── hooks/
    │   └── useFilters.ts       # 滤芯数据管理 Hook
    ├── services/
    │   ├── cloudStorage.ts     # 云端存储服务
    │   └── storage.ts          # 本地存储服务
    ├── types/
    │   └── types.ts            # 类型定义
    └── utils/
        ├── color.ts            # 颜色工具
        └── filters.ts          # 滤芯计算工具
```

### 4.3 数据模型

#### 4.3.1 滤芯数据 (FilterModel)
```typescript
type FilterModel = {
  letter: FilterLetter;       // A-Z 唯一标识
  startedAt: number;          // 启用时间戳 (ms)
  lifespanDays: number;       // 设计寿命 (天)
  label?: string;             // 自定义名称
};
```

#### 4.3.2 云端数据 (CloudDataV1)
```typescript
type CloudDataV1 = {
  version: 1;
  filters: FilterModel[];
  title?: string;             // 设备标题
};
```

### 4.4 存储方案

#### 4.4.1 本地存储键值
| 键名 | 用途 |
|------|------|
| @purifier_filters | 滤芯数组 JSON |
| @purifier_cloud_key | 云端同步密钥 |
| @purifier_title | 设备标题 |

#### 4.4.2 云端存储 API
- **读取**: `GET https://textdb.online/{key}`
- **写入**: `GET https://textdb.online/update/?key={key}&value={value}`
- **Key 格式**: 6-60 位字符，支持 0-9a-zA-Z-_

### 4.5 核心算法

#### 4.5.1 进度计算
```typescript
function computeFilterProgress(f: FilterModel, now: number = Date.now()) {
  const usedDays = Math.max(0, daysBetween(f.startedAt, now));
  const remaining = Math.max(0, f.lifespanDays - usedDays);
  const progress = clamp01(remaining / Math.max(1, f.lifespanDays));
  return { usedDays, remaining, progress };
}
```

#### 4.5.2 颜色插值
```typescript
function interpolateHex(start: HexColor, end: HexColor, t: number): HexColor {
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  return rgbToHex(
    lerp(s.r, e.r, t),
    lerp(s.g, e.g, t),
    lerp(s.b, e.b, t)
  );
}
```

---

## 5. UI 组件设计

### 5.1 PurifierUnit (净水器主体)
| 属性 | 类型 | 说明 |
|------|------|------|
| width | number | 容器宽度 |
| title | string | 标题文字 |
| editableTitle | boolean | 是否可编辑标题 |
| filters | Array | 滤芯数据数组 |
| onFilterLongPress | Function | 长按回调 |
| onAdd/onRemove | Function | 添加/删除回调 |

### 5.2 FilterCapsule (滤芯胶囊)
| 属性 | 类型 | 说明 |
|------|------|------|
| progress | number | 进度 0-1 |
| width/height | number | 尺寸 |
| startColor/endColor | string | 起止颜色 |
| daysRemaining | number | 剩余天数 |
| label | string | 标签文本 |
| enableToggle | boolean | 点击切换显示 |

### 5.3 对话框组件
- **AlertDialog**: 单按钮提示
- **ConfirmDialog**: 双按钮确认
- **ContextMenu**: 上下文操作菜单
- **FilterEditModal**: 滤芯编辑表单
- **CloudSyncModal**: 云端同步设置

---

## 6. 交互流程

### 6.1 首次使用流程
```
启动应用 → 加载本地数据 → 无数据 → 加载默认滤芯 → 显示主界面
```

### 6.2 云端同步流程
```
点击云端同步 → 选择"生成新密钥"/"使用已有密钥"
→ 启用同步 → 上传数据 → 显示同步状态 → 自动同步
```

### 6.3 编辑滤芯流程
```
长按滤芯 → 弹出上下文菜单 → 选择"编辑"
→ 修改参数 → 保存 → 自动同步到云端
```

---

## 7. 非功能需求

### 7.1 性能要求
- 应用启动时间 < 3 秒
- 数据保存/加载 < 500ms
- UI 响应时间 < 100ms

### 7.2 数据安全
- 本地数据加密存储
- 云端传输使用 HTTPS
- 同步密钥随机生成 (20 位以上)

### 7.3 兼容性
- iOS 12.0+
- Android 6.0+
- Web: 现代浏览器

### 7.4 可用性
- 支持离线使用
- 数据自动保存
- 操作撤销/确认机制

---

## 8. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2024-01 | 初始版本，基础滤芯管理功能 |
| 1.0.1 | 2024-02 | 添加云端同步功能 |
| 1.0.2 | 2024-03 | 优化 UI 动画，添加水流效果 |

---

## 9. 附录

### 9.1 相关文档
- [README.md](../README.md) - 快速开始指南
- [LICENSE](../LICENSE) - 开源许可证

### 9.2 外部依赖
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TextDB.online API](https://textdb.online/)

---

*文档生成日期：2026-03-13*
