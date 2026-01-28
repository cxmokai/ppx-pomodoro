# Firebase 设置指南

## 步骤 1：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "添加项目"
3. 填写项目信息：
   - **项目名称**：`pomodoro-timer`（或你喜欢的名称）
   - **Google Analytics**：暂时禁用（可选）

## 步骤 2：启用 Authentication（Google 登录）

1. 在 Firebase Console 中，点击左侧菜单 **Authentication**
2. 点击 **开始使用**
3. 选择 **Sign-in method** 标签页
4. 点击 **Google** 提供商
5. 启用 Google 登录：
   - 状态：**启用**
   - 项目公开名称：`Pomodoro Timer`
   - 项目支持电子邮件：`your-email@example.com`
   - 点击 **保存**

## 步骤 3：创建 Firestore 数据库

1. 在 Firebase Console 中，点击左侧菜单 **Firestore Database**
2. 点击 **创建数据库**
3. 选择数据库位置：推荐选择 **nam5 (us-central)** 或离你最近的区域
4. 选择 **以生产模式启动**（启用安全规则）
5. 点击 **启用**

## 步骤 4：配置安全规则

有两种方式配置安全规则：

### 方式 A：通过 Firebase Console

1. 在 Firestore 页面，点击 **规则** 标签页
2. 将以下规则复制并粘贴：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. 点击 **发布**

### 方式 B：通过 Firebase CLI（推荐）

```bash
# 安装 Firebase CLI
pnpm add -D firebase-tools

# 登录 Firebase
npx firebase login

# 初始化 Firebase
npx firebase init firestore

# 选择项目后会自动同步规则文件
```

## 步骤 5：获取 Firebase 配置

1. 在 Firebase Console 中，点击项目设置图标（齿轮）
2. 滚动到 **您的应用** 部分
3. 点击 **</>** 图标（Web 应用）
4. 填写应用名称：`Pomodoro Timer`
5. **暂不**勾选 "Firebase SDK snippet" 中的 "Also set up Firebase Hosting"
6. 点击 **注册应用**
7. 复制 `firebaseConfig` 对象中的所有配置值

## 步骤 6：配置本地环境变量

1. 复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

2. 将 Firebase 配置粘贴到 `.env` 文件中：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=pomodoro-timer.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pomodoro-timer
VITE_FIREBASE_STORAGE_BUCKET=pomodoro-timer.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## 步骤 7：验证配置

启动开发服务器：

```bash
pnpm run dev
```

在浏览器中打开 http://localhost:5173/

1. 点击右上角的 **SIGN IN** 按钮
2. 使用 Google 账号登录
3. 登录成功后，按钮应显示你的邮箱地址

## 步骤 8：测试数据同步

### 测试场景 1：未登录状态
1. 不要登录
2. 添加任务并完成
3. 检查 localStorage 是否保存了数据

### 测试场景 2：登录后同步
1. 登录账号
2. 修改设置（如工作时长）
3. 打开浏览器控制台，检查是否有 `[SyncManager] Write successful` 日志
4. 在 Firebase Console -> Firestore -> Data 中查看是否有数据

### 测试场景 3：多设备同步
1. 在浏览器 A 中登录并添加任务
2. 在浏览器 B（无痕模式）中登录同一账号
3. 检查数据是否同步

### 测试场景 4：离线使用
1. 登录账号
2. 开启飞行模式
3. 完成番茄会话
4. 关闭飞行模式
5. 检查数据是否自动同步到 Firestore

## 故障排除

### 问题：登录后看不到数据
**解决方案**：
- 检查 Firestore 安全规则是否正确
- 确认 `uid` 匹配：`request.auth.uid == userId`

### 问题：写入 Firestore 失败
**解决方案**：
- 检查 Firebase Console 日志
- 查看浏览器控制台是否有 `[SyncManager]` 相关错误
- 确认 Firestore 数据库已创建

### 问题：环境变量未生效
**解决方案**：
- 确认 `.env` 文件在项目根目录
- 重启开发服务器
- 确认变量名以 `VITE_` 开头

## 数据结构

Firestore 中的数据结构：

```
user_data/
  └── {userId}/
      ├── sessions: []
      ├── tasks: [
      │     { id, title, completed, createdAt, completedAt },
      │     ...
      │   ]
      ├── settings: {
      │     workDuration: 25,
      │     shortBreakDuration: 5,
      │     longBreakDuration: 15,
      │     longBreakInterval: 4,
      │     soundEnabled: true,
      │     theme: "dark"
      │   }
      └── updatedAt: Timestamp
```

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到 Git
2. 确保 `.gitignore` 包含 `.env`
3. Firestore 安全规则确保用户只能访问自己的数据
4. 考虑启用 Firebase App Check 以防止滥用

## 成本估算

### Spark 计划（免费）
- Firestore 读取：50,000/天
- Firestore 写入：20,000/天
- Firestore 删除：20,000/天

### Blaze 计划（按量付费）
- $0.18/GB 存储空间
- $0.06/100,000 次读取
- $0.18/100,000 次写入
- $0.02/100,000 次删除

**番茄钟应用预计使用量**（单用户/天）：
- 读取：~10-20 次
- 写入：~5-10 次（每次完成任务）
- 免费计划完全足够个人使用
