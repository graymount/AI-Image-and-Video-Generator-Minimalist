# AI 图像与视频生成器模板

一个现代化的全栈 Web 应用模板，用于 AI 驱动的图像和视频生成，基于 Next.js 14、TypeScript 构建，并集成了 Replicate AI API。

## 🎯 功能特性

### 核心功能
- **AI 视频生成**：使用先进的 AI 模型将静态图像转换为动态视频
- **文字生成图像**：使用 AI 从文本提示生成图像
- **图像转视频**：将上传的图像转换为动画视频
- **多语言支持**：使用 Next-intl 实现国际化（默认支持英语）
- **用户仪表板**：个人工作空间，用于管理生成的内容

### 技术特性
- **身份验证**：通过 Better Auth 实现安全的 OAuth 集成
- **支付集成**：Creem 集成用于订阅管理
- **云存储**：AWS S3/Cloudflare R2 用于媒体存储
- **数据库**：PostgreSQL 用于数据持久化
- **响应式设计**：使用 Tailwind CSS 的移动优先设计
- **现代 UI**：使用 NextUI 和 Hero UI 组件构建
- **SEO 优化**：Next.js SEO 与站点地图生成

## 🚀 技术栈

### 前端
- **框架**：Next.js 14.2.11（App Router）
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 3.4 + NextUI/HeroUI
- **动画**：Framer Motion + GSAP
- **图标**：Lucide React + React Icons

### 后端
- **API**：Next.js API Routes
- **数据库**：PostgreSQL with pg 驱动
- **身份验证**：Better Auth
- **AI 集成**：Replicate API
- **文件存储**：AWS S3 / Cloudflare R2
- **支付**：Creem

### 开发工具
- **包管理器**：npm
- **代码质量**：ESLint + TypeScript
- **构建工具**：Next.js 内置打包器

## 📦 安装

### 前置要求
- Node.js 18+ 
- PostgreSQL 数据库
- Creem 账户（用于支付）
- Google OAuth 凭证
- Replicate API 密钥
- AWS S3 或 Cloudflare R2 凭证

### 环境变量
在根目录创建 `.env.local` 文件：

```env
# 数据库
POSTGRES_URL=your_postgresql_connection_string

# 身份验证
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_google_redirect_uri

# Replicate AI
REPLICATE_API_TOKEN=your_replicate_api_token

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# 存储 (S3/R2)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name
```

### 设置说明

1. 克隆仓库：
```bash
git clone <repository-url>
cd ai-image-video-template
```

2. 安装依赖：
```bash
npm install
```

3. 初始化数据库：
```bash
psql -U your_username -d your_database -f src/backend/sql/init.sql
```

4. 运行开发服务器：
```bash
npm run dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 🏗️ 项目结构

```
ai-image-video-template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # 国际化路由
│   │   │   ├── (free)/         # 公开页面
│   │   │   │   ├── dashboard/  # 用户仪表板
│   │   │   │   ├── pricing/    # 定价页面
│   │   │   │   └── text-to-image/ # 文字生成图像
│   │   │   └── layout.tsx      # 主布局
│   │   ├── api/                # API 路由
│   │   │   ├── auth/           # NextAuth 端点
│   │   │   ├── predictions/    # AI 生成端点
│   │   │   ├── webhook/        # Stripe & Replicate webhooks
│   │   │   └── r2/             # 文件上传端点
│   │   └── globals.css         # 全局样式
│   ├── backend/                 # 后端逻辑
│   │   ├── models/             # 数据库模型
│   │   ├── service/            # 业务逻辑服务
│   │   └── config/             # 数据库配置
│   ├── components/             # React 组件
│   │   ├── landingpage/        # 落地页部分
│   │   ├── replicate/          # AI 生成组件
│   │   ├── layout/             # 布局组件
│   │   └── price/              # 定价组件
│   └── config/                 # 应用配置
├── public/                     # 静态资源
├── messages/                   # i18n 翻译
└── package.json               # 依赖项
```

## 📜 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器

# 生产
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run build:prod   # 使用 NODE_ENV=production 构建

# 代码质量
npm run lint         # 运行 ESLint

# 站点地图
npm run postbuild    # 生成站点地图（构建后自动运行）
```

## 💳 订阅计划

模板包含基于积分的系统和订阅层级：
- **免费试用**：5 个积分用于探索功能
- **月度计划**：每月计费的常规积分
- **年度计划**：折扣年度计费，最佳价值
- **按需付费**：根据需要购买额外积分

## 🔒 安全特性

- 使用 NextAuth.js 的安全身份验证
- 环境变量保护
- 使用参数化查询防止 SQL 注入
- 生产环境强制 HTTPS
- Stripe webhook 签名验证
- 用户数据的工业级加密

## 🌍 国际化

内置 next-intl 多语言支持：
- 默认语言：英语
- 易于添加新语言
- 每种语言的 SEO 友好 URL
- 自动语言环境检测

## 📱 响应式设计

- 移动优先方法
- 针对所有屏幕尺寸优化
- 触摸友好界面
- 渐进式 Web 应用就绪

## 🚢 部署

### Vercel（推荐）
1. 将 GitHub 仓库连接到 Vercel
2. 在 Vercel 仪表板中配置环境变量
3. 一键部署

### 自定义部署
1. 构建应用：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm run start
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件。

---

使用 Next.js、TypeScript 和 AI 技术用心打造 ❤️# AI-Image-and-Video-Generator-Minimalist-Template
