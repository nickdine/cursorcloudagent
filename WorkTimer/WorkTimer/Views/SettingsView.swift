import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var notifications: NotificationManager

    private let intervalOptions = [15, 30, 45, 60, 90, 120, 180]

    var body: some View {
        Form {
            Section("提醒") {
                Toggle("定时提醒", isOn: $notifications.remindersEnabled)

                Picker("提醒间隔", selection: $notifications.reminderIntervalMinutes) {
                    ForEach(intervalOptions, id: \.self) { minutes in
                        Text(intervalLabel(minutes)).tag(minutes)
                    }
                }
                .disabled(!notifications.remindersEnabled)
            }

            Section("说明") {
                Text("WorkTimer 会在菜单栏显示今日工作时长，并按设定间隔发送系统通知提醒你已工作多久。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("每天首次打开时会自动重置昨日未结束的计时。")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(width: 420, height: 260)
    }

    private func intervalLabel(_ minutes: Int) -> String {
        if minutes >= 60 {
            let hours = minutes / 60
            let rest = minutes % 60
            if rest == 0 {
                return "每 \(hours) 小时"
            }
            return "每 \(hours) 小时 \(rest) 分钟"
        }
        return "每 \(minutes) 分钟"
    }
}
