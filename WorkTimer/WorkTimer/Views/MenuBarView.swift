import SwiftUI

struct MenuBarView: View {
    @EnvironmentObject private var session: WorkSessionManager
    @EnvironmentObject private var notifications: NotificationManager
    @Environment(\.openSettings) private var openSettings

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            header
            Divider()
            controls
            Divider()
            footer
        }
        .padding(14)
        .frame(width: 260)
        .onChange(of: session.state) { _, _ in
            refreshReminders()
        }
        .onChange(of: notifications.reminderIntervalMinutes) { _, _ in
            refreshReminders()
        }
        .onChange(of: notifications.remindersEnabled) { _, _ in
            refreshReminders()
        }
        .onAppear {
            refreshReminders()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("今日工作时长")
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(WorkSessionManager.format(session.elapsedSeconds))
                .font(.system(size: 28, weight: .semibold, design: .rounded))
                .monospacedDigit()
            statusBadge
        }
    }

    private var statusBadge: some View {
        let (text, color): (String, Color) = switch session.state {
        case .idle: ("未开始", .secondary)
        case .working: ("计时中", .green)
        case .paused: ("已暂停", .orange)
        }

        return Text(text)
            .font(.caption.weight(.medium))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }

    private var controls: some View {
        VStack(spacing: 8) {
            switch session.state {
            case .idle:
                Button("开始工作") { session.start() }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
            case .working:
                HStack {
                    Button("暂停") { session.pause() }
                    Button("结束") { session.stop() }
                        .tint(.red)
                }
            case .paused:
                HStack {
                    Button("继续") { session.resume() }
                        .buttonStyle(.borderedProminent)
                    Button("结束") { session.stop() }
                        .tint(.red)
                }
            }
        }
    }

    private var footer: some View {
        HStack {
            Button("设置…") { openSettings() }
            Spacer()
            Button("退出") { NSApplication.shared.terminate(nil) }
        }
        .buttonStyle(.plain)
        .font(.caption)
        .foregroundStyle(.secondary)
    }

    private func refreshReminders() {
        notifications.scheduleReminders(
            for: session.elapsedSeconds,
            isRunning: session.isRunning
        )
    }
}
