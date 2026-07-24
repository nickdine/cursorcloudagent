# WorkTimer

macOS 菜单栏应用，帮你记录今日工作时长，并定时提醒你已工作多久。

## 功能

- **菜单栏计时**：在顶部菜单栏显示今日累计工作时长（如 `2:30`）
- **开始 / 暂停 / 继续 / 结束**：一键控制工作状态
- **定时提醒**：按设定间隔发送系统通知，例如「你已经工作了 1 小时 00 分 00 秒，记得休息一下。」
- **自动保存**：关闭应用后重新打开，计时状态会自动恢复
- **每日重置**：跨天后自动清零昨日未结束的计时

## 系统要求

- macOS 13.0 (Ventura) 或更高版本
- Xcode 15 或更高版本

## 构建与运行

1. 用 Xcode 打开 `WorkTimer/WorkTimer.xcodeproj`
2. 选择 **WorkTimer** scheme，目标设备选 **My Mac**
3. 按 `Cmd + R` 运行

首次运行时，系统会请求通知权限，请允许以便接收工作提醒。

## 使用说明

1. 点击菜单栏中的时钟图标
2. 点击 **开始工作** 开始计时
3. 需要休息时点击 **暂停**，继续工作时点击 **继续**
4. 下班时点击 **结束** 清零今日计时
5. 在 **设置** 中可调整提醒间隔（15 分钟 ~ 3 小时）

## 项目结构

```
WorkTimer/
├── WorkTimer.xcodeproj
└── WorkTimer/
    ├── WorkTimerApp.swift          # 应用入口，菜单栏场景
    ├── Models/
    │   ├── WorkSessionManager.swift # 计时逻辑与持久化
    │   └── NotificationManager.swift # 系统通知调度
    └── Views/
        ├── MenuBarView.swift        # 菜单栏弹出面板
        └── SettingsView.swift       # 设置窗口
```

## 技术说明

- SwiftUI + `MenuBarExtra` 实现纯菜单栏应用（不显示 Dock 图标）
- `UserNotifications` 框架发送本地通知
- `UserDefaults` 持久化计时状态与设置
