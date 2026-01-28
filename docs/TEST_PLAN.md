# Firebase 集成测试计划

## 测试环境

- **项目**: ppx-pomodoro
- **测试日期**: 2025-01-28
- **Firebase 版本**: 12.8.0
- **测试 URL**: http://localhost:5176

## 测试用例列表

### 1. 认证功能测试 (Authentication)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| AUTH-01 | 未登录状态显示 | 显示 "SIGN IN" 按钮 | ⬜ |
| AUTH-02 | 点击 Google 登录 | 弹出 Google 登录窗口 | ⬜ |
| AUTH-03 | 登录成功后 | 按钮显示用户邮箱 + 登出图标 | ⬜ |
| AUTH-04 | 登录成功后 Console 日志 | 出现 `[Storage] User logged in, scheduling Firestore write` | ⬜ |
| AUTH-05 | 鼠标悬停登录后按钮 | 显示 "Sign out (xxx@xxx.com)" | ⬜ |
| AUTH-06 | 点击登出 | 弹出确认或直接登出，按钮变为 "SIGN IN" | ⬜ |
| AUTH-07 | 登出后数据保留 | 本地数据（任务、设置）仍然可用 | ⬜ |
| AUTH-08 | 页面刷新后登录状态 | 登录状态保持 | ⬜ |

---

### 2. 数据同步测试 (Data Synchronization)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| SYNC-01 | 修改设置（工作时长） | `[SyncManager] scheduleWrite called` 仅出现 1 次 | ⬜ |
| SYNC-02 | 1.2秒后 Console 日志 | `[SyncManager] Debounce timer fired` → `[SyncManager] Write successful` | ⬜ |
| SYNC-03 | Firestore 数据库 | `/user_data/{userId}` 文档被创建/更新 | ⬜ |
| SYNC-04 | 添加任务 | 任务保存在 `pomodoro_data_v3` localStorage | ⬜ |
| SYNC-05 | 完成任务 | 任务添加到已完成列表 | ⬜ |
| SYNC-06 | 切换主题 | 主题立即生效，1.2s 后同步到 Firestore | ⬜ |
| SYNC-07 | 连续修改设置 | 防抖机制工作，只最后一次触发写入 | ⬜ |

---

### 3. 离线功能测试 (Offline Mode)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| OFF-01 | 开启飞行模式 | 应用仍可正常使用 | ⬜ |
| OFF-02 | 离线状态下完成任务 | 任务保存到 localStorage | ⬜ |
| OFF-03 | 离线状态下修改设置 | 设置立即生效 | ⬜ |
| OFF-04 | 离线状态 Console 日志 | `[Storage] User logged in, saved to localStorage only` | ⬜ |
| OFF-05 | 关闭飞行模式 | `[Storage] Network online, retrying pending writes` | ⬜ |
| OFF-06 | 重新上线后 | `[SyncManager] Write successful` 数据同步到 Firestore | ⬜ |
| OFF-07 | 离线期间多次操作 | 上线后所有操作合并同步 | ⬜ |

---

### 4. 多设备同步测试 (Multi-Device Sync)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| MULTI-01 | 设备 A 登录并添加任务 | 任务同步到 Firestore | ⬜ |
| MULTI-02 | 设备 B（无痕模式）登录同一账号 | 设备 A 的任务出现在设备 B 上 | ⬜ |
| MULTI-03 | 设备 B 修改设置 | 设备 A 的设置自动更新（需要页面刷新或实时监听） | ⬜ |
| MULTI-04 | 设备 A 完成任务 | 设备 B 的已完成列表更新 | ⬜ |
| MULTI-05 | 同时在线修改 | 最后写入的数据胜出（基于 lastUpdated） | ⬜ |

---

### 5. 数据迁移测试 (Data Migration)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| MIG-01 | 首次访问新版本 | `[Migration] No migration needed` | ⬜ |
| MIG-02 | 清空 localStorage 后刷新 | 数据从 Firestore 恢复 | ⬜ |
| MIG-03 | 旧格式数据存在 | 自动迁移到 `pomodoro_data_v3` | ⬜ |
| MIG-04 | 迁移后 Console 日志 | `[Migration] Migration complete!` | ⬜ |

---

### 6. UI/UX 测试

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| UI-01 | 顶部三个按钮高度一致 | 所有按钮 h-10，对齐整齐 | ⬜ |
| UI-02 | 登录后按钮显示 | 显示邮箱（桌面端），仅图标（移动端） | ⬜ |
| UI-03 | 移动端响应式 | 小屏幕隐藏文字，只显示图标 | ⬜ |
| UI-04 | 加载状态 | 登录中显示 "..." | ⬜ |

---

### 7. 错误处理测试 (Error Handling)

| 用例ID | 测试场景 | 预期结果 | 状态 |
|--------|----------|----------|------|
| ERR-01 | Firestore 权限被拒绝 | `[SyncManager] Permission denied` 日志，稍后重试 | ⬜ |
| ERR-02 | 网络断开 | 数据保存到本地，上线后重试 | ⬜ |
| ERR-03 | 登录弹窗关闭 | `[Storage] User not logged in, saved to localStorage only` | ⬜ |
| ERR-04 | 无效的 Firebase 配置 | 优雅降级到 localStorage 模式 | ⬜ |

---

## 测试执行记录

### 执行摘要

- **总用例数**: 42
- **已测试**: 0
- **通过**: 0
- **失败**: 0
- **待测试**: 42

### 详细结果

#### 1. 认证功能测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| AUTH-01 | ⬜ | |
| AUTH-02 | ⬜ | |
| AUTH-03 | ⬜ | |
| AUTH-04 | ⬜ | |
| AUTH-05 | ⬜ | |
| AUTH-06 | ⬜ | |
| AUTH-07 | ⬜ | |
| AUTH-08 | ⬜ | |

#### 2. 数据同步测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| SYNC-01 | ⬜ | |
| SYNC-02 | ⬜ | |
| SYNC-03 | ⬜ | |
| SYNC-04 | ⬜ | |
| SYNC-05 | ⬜ | |
| SYNC-06 | ⬜ | |
| SYNC-07 | ⬜ | |

#### 3. 离线功能测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| OFF-01 | ⬜ | |
| OFF-02 | ⬜ | |
| OFF-03 | ⬜ | |
| OFF-04 | ⬜ | |
| OFF-05 | ⬜ | |
| OFF-06 | ⬜ | |
| OFF-07 | ⬜ | |

#### 4. 多设备同步测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| MULTI-01 | ⬜ | |
| MULTI-02 | ⬜ | |
| MULTI-03 | ⬜ | |
| MULTI-04 | ⬜ | |
| MULTI-05 | ⬜ | |

#### 5. 数据迁移测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| MIG-01 | ⬜ | |
| MIG-02 | ⬜ | |
| MIG-03 | ⬜ | |
| MIG-04 | ⬜ | |

#### 6. UI/UX 测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| UI-01 | ⬜ | |
| UI-02 | ⬜ | |
| UI-03 | ⬜ | |
| UI-04 | ⬜ | |

#### 7. 错误处理测试

| 用例ID | 结果 | 备注 |
|--------|------|------|
| ERR-01 | ⬜ | |
| ERR-02 | ⬜ | |
| ERR-03 | ⬜ | |
| ERR-04 | ⬜ | |

---

## 发现的 Bug

| Bug ID | 问题描述 | 严重程度 | 状态 |
|--------|----------|----------|------|
| BUG-001 | | | ⬜ |

---

## 测试结论

- **整体状态**: ⬜ 通过 / ❌ 失败
- **建议**:
