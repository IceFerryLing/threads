# Threads 社交媒体应用

一个基于 Next.js 16 构建的现代化社交媒体应用，类似于 Threads，支持用户发布帖子、加入社区、互动交流等功能。

## 功能特点

### 核心功能
- **用户认证**：登录、注册、引导流程
- **帖子管理**：创建、查看、删除帖子，支持回复功能
- **社区系统**：创建社区、加入社区、管理社区成员
- **用户资料**：个人资料查看和编辑
- **活动中心**：查看互动活动
- **搜索功能**：搜索用户和社区
- **文件上传**：支持图片上传

### 技术特点
- **现代化架构**：Next.js 16 App Router, React 19, TypeScript
- **响应式设计**：Tailwind CSS 构建的响应式界面
- **数据库集成**：MongoDB + Mongoose
- **认证系统**：Clerk 认证解决方案
- **UI 组件**：Radix UI + Lucide React 图标
- **表单处理**：React Hook Form + Zod 验证
- **文件上传**：UploadThing 集成
- **服务器操作**：Next.js Server Actions

## 技术栈

### 前端
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React
- React Hook Form
- Zod

### 后端
- Next.js API Routes
- MongoDB (Mongoose)
- Clerk Authentication
- UploadThing

## 安装指南

### 前提条件
- Node.js 18+
- MongoDB 数据库
- Clerk 账户
- UploadThing 账户

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/threads.git
   cd threads
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env.local` 文件并添加以下内容：
   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_SIGN_IN_URL=/sign-in
   CLERK_SIGN_UP_URL=/sign-up
   CLERK_AFTER_SIGN_IN_URL=/
   CLERK_AFTER_SIGN_UP_URL=/onboarding

   # UploadThing
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

4. **运行开发服务器**
   ```bash
   npm run dev
   ```

5. **构建生产版本**
   ```bash
   npm run build
   npm start
   ```

## 项目结构

```
├── app/                 # Next.js App Router 路由和页面
│   ├── (auth)/          # 认证相关页面
│   ├── (root)/          # 主应用页面
│   ├── api/             # API 路由
│   └── globals.css      # 全局样式
├── components/          # UI 组件
│   ├── cards/           # 卡片组件
│   ├── forms/           # 表单组件
│   ├── shared/          # 共享组件
│   └── ui/              # 基础 UI 组件
├── constants/           # 常量定义
├── lib/                 # 工具库
│   ├── actions/         # 服务器操作
│   ├── models/          # MongoDB 模型
│   ├── validations/     # 数据验证
│   └── mongoose.ts      # MongoDB 连接
├── public/              # 静态资源
└── package.json         # 项目配置
```

## 组件阅读指南

### 组件分类

1. **基础 UI 组件** (`components/ui/`)
   - 纯 UI 组件，无业务逻辑
   - 可复用的原子组件
   - 示例：按钮、输入框、标签等

2. **卡片组件** (`components/cards/`)
   - 展示型组件，用于显示数据
   - 包含用户卡片、帖子卡片、社区卡片

3. **表单组件** (`components/forms/`)
   - 处理用户输入的组件
   - 包含表单验证和提交逻辑

4. **共享组件** (`components/shared/`)
   - 应用中多处使用的组件
   - 包含导航栏、侧边栏、分页等

### 组件阅读顺序

1. **从页面开始**：查看 `app/` 目录下的页面组件，了解整体结构
2. **分析共享组件**：查看 `components/shared/` 中的导航和布局组件
3. **理解卡片组件**：查看 `components/cards/` 中的数据展示组件
4. **研究表单组件**：查看 `components/forms/` 中的用户输入处理
5. **探索基础 UI**：查看 `components/ui/` 中的基础构建块

### 关键组件解析

#### ProfileHeader.tsx
- **功能**：显示用户个人资料信息
- **参数**：accountId, authUserId, name, username, imgUrl, bio
- **使用场景**：用户个人资料页面顶部

#### ThreadsTab.tsx
- **功能**：显示帖子列表，支持不同类型的帖子筛选
- **参数**：currentUserId, accountId, accountType
- **使用场景**：用户资料页面和社区页面

#### PostThread.tsx
- **功能**：创建新帖子的表单
- **使用场景**：首页和创建帖子页面

#### CommunityCard.tsx
- **功能**：显示社区信息卡片
- **参数**：community 对象
- **使用场景**：社区列表页面

### 服务器操作指南

服务器操作位于 `lib/actions/` 目录，用于处理后端逻辑：

1. **user.action.ts**：用户相关操作（获取用户信息、更新用户资料、获取用户帖子等）
2. **thread.action.ts**：帖子相关操作（创建帖子、获取帖子、删除帖子、添加评论等）
3. **community.action.ts**：社区相关操作（创建社区、获取社区、管理成员等）

### 模型结构

数据模型位于 `lib/models/` 目录：

1. **user.model.ts**：用户模型，包含用户基本信息、帖子和社区关联
2. **thread.model.ts**：帖子模型，包含帖子内容、作者、社区、回复等
3. **community.model.ts**：社区模型，包含社区信息、创建者、成员和帖子

## 开发指南

### 代码规范
- 使用 TypeScript 类型定义
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名
- 使用 Tailwind CSS 进行样式设计
- 服务器操作使用 `"use server"` 指令

### 新增功能流程
1. 在 `app/` 目录创建新的路由
2. 在 `components/` 目录创建相关组件
3. 在 `lib/actions/` 目录添加服务器操作
4. 在 `lib/models/` 目录更新数据模型（如需）

### 调试技巧
- 使用 `npm run dev` 启动开发服务器
- 访问 `http://localhost:3000` 查看应用
- 使用浏览器开发者工具调试前端
- 查看终端输出调试后端 API

## 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量（同 `.env.local`）
3. 点击部署按钮

### 其他平台
1. 构建项目：`npm run build`
2. 启动应用：`npm start`
3. 确保环境变量正确配置

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过 GitHub Issues 联系。