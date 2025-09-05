# Stripe 到 Creem 迁移指南

## 迁移概述

本项目已成功从 Stripe 付款系统迁移到 Creem 付款系统。以下是详细的迁移变更和配置指南。

## 🔄 主要变更

### 1. 依赖包更新

#### 移除的包：
- `stripe` - Stripe Node.js SDK
- `@stripe/stripe-js` - Stripe 客户端库  
- `next-auth` - NextAuth.js 身份验证

#### 添加的包：
- `creem` - Creem 付款 SDK
- `better-auth` - 现代身份验证库
- `better-sqlite3` - Better Auth 依赖
- `@prisma/client` - 数据库 ORM
- `prisma` - 数据库工具

### 2. API 路由更新

#### 更新的文件：
- `src/app/api/checkout/route.ts` - 集成 Creem 结账 API
- `src/app/api/webhook/creem/route.ts` - 处理 Creem webhook 事件
- `src/app/api/auth/[...auth]/route.ts` - Better Auth 路由

#### 删除的文件：
- `src/app/api/auth/[...nextauth]/route.ts` - 旧的 NextAuth 配置
- `src/app/api/webhook/stripe/route.ts` - 旧的 Stripe webhook

### 3. 数据库模式更新

所有 Stripe 相关字段已重命名为 Creem 对应字段：

#### 字段映射：
- `stripe_price_id` → `creem_product_id`
- `stripe_subscription_id` → `creem_subscription_id`
- `stripe_customer_id` → `creem_customer_id`
- `stripe_payment_intent_id` → `creem_payment_intent_id`

#### 更新的表：
- `subscription_plans` - 订阅计划表
- `user_subscriptions` - 用户订阅表
- `payment_history` - 支付历史表

### 4. 身份验证系统更新

从 NextAuth.js 迁移到 Better Auth：

#### 新文件：
- `src/lib/auth.ts` - Better Auth 配置
- `src/providers/auth.tsx` - 身份验证客户端
- `prisma/schema.prisma` - 新的数据库模式

#### 删除的文件：
- `src/providers/session.tsx` - 旧的 NextAuth 提供者

## 🔧 配置要求

### 环境变量

需要设置以下新的环境变量：

```env
# Creem 付款系统
CREEM_API_KEY="your_creem_api_key_here"
SUCCESS_URL="http://localhost:3000/success"

# Better Auth
BETTER_AUTH_SECRET="your-better-auth-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# OAuth 提供者
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# 数据库（更新为支持 Prisma）
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

### 移除的环境变量：
- `STRIPE_PRIVATE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📊 数据库迁移

### 1. 运行 Prisma 迁移

```bash
# 生成 Prisma 客户端
npx prisma generate

# 应用数据库迁移
npx prisma db push
```

### 2. 数据迁移脚本

如果你有现有的 Stripe 数据，需要手动迁移：

```sql
-- 更新订阅计划表
ALTER TABLE subscription_plans 
RENAME COLUMN stripe_price_id TO creem_product_id;

-- 更新用户订阅表
ALTER TABLE user_subscriptions 
RENAME COLUMN stripe_price_id TO creem_product_id;
ALTER TABLE user_subscriptions 
RENAME COLUMN stripe_subscription_id TO creem_subscription_id;
ALTER TABLE user_subscriptions 
RENAME COLUMN stripe_customer_id TO creem_customer_id;

-- 更新支付历史表
ALTER TABLE payment_history 
RENAME COLUMN stripe_price_id TO creem_product_id;
ALTER TABLE payment_history 
RENAME COLUMN stripe_subscription_id TO creem_subscription_id;
ALTER TABLE payment_history 
RENAME COLUMN stripe_customer_id TO creem_customer_id;
ALTER TABLE payment_history 
RENAME COLUMN stripe_payment_intent_id TO creem_payment_intent_id;
```

## 🚀 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 设置环境变量
复制并配置环境变量文件

### 3. 配置数据库
```bash
npx prisma generate
npx prisma db push
```

### 4. 配置 Creem
- 在 Creem 仪表板中创建产品
- 设置 webhook 端点：`your-domain.com/api/webhook/creem`
- 获取 API 密钥

### 5. 配置 OAuth
- 更新 GitHub/Google OAuth 应用的回调 URL
- 新的回调格式：`your-domain.com/api/auth/callback/[provider]`

## 🔍 测试验证

### 1. 功能测试清单
- [ ] 用户注册/登录
- [ ] OAuth 登录（GitHub/Google）
- [ ] 订阅购买流程
- [ ] Webhook 事件处理
- [ ] 支付状态更新
- [ ] 用户仪表板访问

### 2. 集成测试
```bash
# 启动开发服务器
npm run dev

# 测试 API 端点
curl -X GET http://localhost:3000/api/auth/session
curl -X POST http://localhost:3000/api/checkout -d '{"product_id":"prod_123"}'
```

## 📋 注意事项

### 1. 数据一致性
- 确保所有现有用户数据正确迁移
- 验证订阅状态和支付历史

### 2. Webhook 配置
- 在 Creem 中配置正确的 webhook URL
- 确保 webhook 签名验证正常工作

### 3. 前端更新
- 前端组件已更新以支持新的 API 结构
- 确保所有支付流程正常工作

### 4. 错误处理
- 检查所有错误处理逻辑
- 确保用户友好的错误消息

## 🆘 故障排除

### 常见问题：

1. **Creem API 调用失败**
   - 检查 `CREEM_API_KEY` 是否正确设置
   - 验证 API 端点和请求格式

2. **Better Auth 登录失败**
   - 确认 `BETTER_AUTH_SECRET` 已设置
   - 检查 OAuth 提供者配置

3. **数据库连接问题**
   - 验证 `DATABASE_URL` 格式
   - 确保 Prisma schema 已同步

4. **Webhook 事件未处理**
   - 检查 webhook URL 配置
   - 验证事件处理逻辑

## 📞 支持

如果遇到迁移问题，请：
1. 检查日志文件
2. 验证环境变量配置
3. 测试 API 端点响应
4. 查看 Creem 文档

---

✅ **迁移完成！** 项目现已成功从 Stripe 迁移到 Creem 付款系统。
