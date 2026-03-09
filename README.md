# amazon-page-monitor-plugin

亚马逊页面数据监控分析插件（v1.0.0）。

这是一个可直接加载到 Chrome/Edge 的 **Manifest V3 浏览器插件**，用于在商品详情页手动抓取并保存关键数据快照。

## 1.0.0 已实现功能（保持简单可用）

- 商品标题抓取
- 商品价格抓取（常见价格节点）
- 评分与评论数抓取
- 排名文本抓取（Best Sellers Rank）
- 按 ASIN 保存历史快照到 `chrome.storage.local`
- 弹窗展示当前数据与历史记录
- 导出当前商品历史为 JSON
- 清空当前商品历史

## 项目结构

```text
amazon-page-monitor-plugin/
├── manifest.json
├── src/
│   ├── background.js
│   └── content.js
└── popup/
    ├── popup.html
    ├── popup.css
    └── popup.js
```

## 安装方式（开发者模式）

1. 打开浏览器扩展管理页：
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
2. 开启 **开发者模式**。
3. 点击 **加载已解压的扩展程序**。
4. 选择本仓库目录。

## 使用流程

1. 打开任意 Amazon 商品详情页。
2. 点击插件图标，弹窗会自动读取当前页面。
3. 点击 **保存快照**，将当前数据写入本地历史。
4. 点击 **导出 JSON**，下载该 ASIN 的历史数据。
5. 如需重置，点击 **清空该商品历史**。

## 注意事项

- 插件仅在配置的 Amazon 站点域名下工作。
- 页面结构变化会影响抓取准确度，后续版本可补充更多选择器兜底。
- 当前版本是草稿阶段的可用 1.0.0，重点是“先跑通核心流程”。

## 后续建议（可选）

- 增加定时监控（alarm + 自动采样）
- 增加价格变动提醒
- 增加图表趋势展示
- 支持 CSV 导出与多商品管理
