# WFHBlog - 现代化博客管理系统

WFHBlog是一个基于Vue 3、TypeScript和Element Plus构建的现代化博客管理系统。它提供了完整的博客管理功能，包括文章管理、用户管理、评论管理等，并具有响应式设计和优雅的用户界面。

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI框架**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP客户端**：Axios
- **构建工具**：Vite
- **图表库**：ECharts
- **Markdown编辑器**：md-editor-v3
- **工具库**：dayjs、@vueuse/core

## 功能特性

### 1. 文章管理
- 文章的创建、编辑、删除
- Markdown编辑器支持
- 文章分类和标签管理
- 文章状态管理（草稿、发布）
- 文章预览功能

### 2. 用户管理
- 用户注册与登录
- 角色权限管理
- 用户信息管理
- 用户状态控制

### 3. 评论系统
- 评论的发布与回复
- 评论审核功能
- 评论状态管理
- 评论通知

### 4. 内容管理
- 分类管理
- 标签管理
- 图库管理
- 文件上传

### 5. 系统设置
- 网站基本信息设置
- 主题设置
- 评论设置
- 系统参数配置

### 6. 仪表盘
- 数据统计展示
- 访问趋势分析
- 内容分布统计
- 最新动态展示

## 项目结构

```
src/
├── api/                # API接口模块
├── assets/            # 静态资源
├── components/        # 公共组件
├── layout/            # 布局组件
├── router/            # 路由配置
├── styles/            # 全局样式
├── views/             # 页面视图
│   ├── article/       # 文章管理
│   ├── category/      # 分类管理
│   ├── comment/       # 评论管理
│   ├── dashboard/     # 仪表盘
│   ├── gallery/       # 图库管理
│   ├── login/         # 登录注册
│   ├── permission/    # 权限管理
│   ├── settings/      # 系统设置
│   ├── tag/           # 标签管理
│   └── user/          # 用户管理
├── App.vue            # 根组件
└── main.ts            # 入口文件
```

## 安装与运行

### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0

### 安装依赖
```bash
# 安装依赖
pnpm install
```

### 开发环境运行
```bash
# 启动开发服务器
pnpm dev
```

### 生产环境构建
```bash
# 构建生产环境代码
pnpm build
```

### 预览生产环境构建
```bash
# 预览生产环境构建
pnpm preview
```

## 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 遵循Vue 3组合式API风格
- 使用TypeScript进行类型检查
- 组件命名采用PascalCase
- 文件命名采用kebab-case

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 浏览器支持

- Chrome >= 80
- Firefox >= 78
- Safari >= 13
- Edge >= 80

