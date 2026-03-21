# 净水器滤芯计时器 - 微信小程序

该目录为与 Expo 版本功能对齐的微信小程序实现（功能一致，视觉接近）。

## 功能

- 滤芯列表、进度百分比/剩余天数切换
- 添加/删除最后一个/长按编辑/删除滤芯
- 锁定保护（限制加减与标题编辑）
- 重置存档
- 本地持久化存储
- 云同步（TextDB.online）：启用、连接已有密钥、拉取、禁用、复制密钥

## 目录结构

```
wechat-miniprogram/
├── app.js
├── app.json
├── app.wxss
├── package.json
├── project.config.json
├── sitemap.json
├── pages/
│   ├── index/
│   └── cloud/
└── utils/
    ├── filters.js
    ├── color.js
    ├── storage.js
    └── cloud.js
```

## 开发方式

1. 在 `wechat-miniprogram` 目录安装依赖：`npm install`
2. 用微信开发者工具打开 `wechat-miniprogram`
3. 在微信开发者工具执行「工具 -> 构建 npm」
4. 点击「编译」运行

## 说明

- 本地存储 key 与 Expo 版保持一致：
  - `@purifier_filters`
  - `@purifier_cloud_key`
  - `@purifier_title`
- 云端数据兼容旧数组格式与 `CloudDataV1` 对象格式。
