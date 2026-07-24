import SwiftUI

@main
struct WorkTimerApp: App {
    @StateObject private var session = WorkSessionManager()
    @StateObject private var notifications = NotificationManager()

    var body: some Scene {
        MenuBarExtra {
            MenuBarView()
                .environmentObject(session)
                .environmentObject(notifications)
        } label: {
            MenuBarLabel(elapsed: session.elapsedSeconds, isRunning: session.isRunning)
        }
        .menuBarExtraStyle(.window)

        Settings {
            SettingsView()
                .environmentObject(session)
                .environmentObject(notifications)
        }
    }
}

private struct MenuBarLabel: View {
    let elapsed: TimeInterval
    let isRunning: Bool

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: isRunning ? "clock.fill" : "clock")
            if elapsed > 0 {
                Text(WorkSessionManager.formatShort(elapsed))
                    .monospacedDigit()
            }
        }
    }
}
