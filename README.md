# 学术研究雷达

一个适合 GitHub Pages 的纯静态研究简报站点。首页默认读取最新一期，读者可以按日期浏览历史报告。

## 数据结构

```text
data/
├── latest.json                 # 最新一期的完整报告
├── index.json                  # 历史期刊索引，按日期倒序
└── reports/
    └── YYYY-MM-DD.json         # 每一期的永久快照
```

每日更新时需要完成三件事：

1. 新建 `data/reports/YYYY-MM-DD.json`。
2. 用同一份内容覆盖 `data/latest.json`。
3. 在 `data/index.json` 的 `issues` 数组开头加入新一期索引。

报告字段与现有 JSON 文件保持一致即可。页面会自动渲染今日摘要、论文信息、概要、推荐理由与今日研究信号。

## 本地预览

静态 JSON 需要通过本地服务器读取，不能直接双击 `index.html`。在仓库根目录运行任意静态服务器即可，例如：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## GitHub Pages

仓库附带 Pages 工作流。首次使用时，在仓库的 `Settings → Pages` 中将 `Source` 设为 `GitHub Actions`；之后每次推送到 `main` 都会自动发布。

