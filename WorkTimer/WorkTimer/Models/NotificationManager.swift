import Foundation
import UserNotifications

@MainActor
final class NotificationManager: ObservableObject {
    @Published var reminderIntervalMinutes: Int {
        didSet {
            let clamped = max(15, min(180, reminderIntervalMinutes))
            if clamped != reminderIntervalMinutes {
                reminderIntervalMinutes = clamped
                return
            }
            defaults.set(clamped, forKey: intervalKey)
        }
    }

    @Published var remindersEnabled: Bool {
        didSet {
            defaults.set(remindersEnabled, forKey: enabledKey)
            if !remindersEnabled {
                cancelReminders()
            }
        }
    }

    private let defaults = UserDefaults.standard
    private let intervalKey = "workTimer.reminderInterval"
    private let enabledKey = "workTimer.remindersEnabled"
    private let reminderPrefix = "workTimer.reminder."

    init() {
        let stored = defaults.integer(forKey: intervalKey)
        reminderIntervalMinutes = stored > 0 ? stored : 60
        if defaults.object(forKey: enabledKey) == nil {
            remindersEnabled = true
        } else {
            remindersEnabled = defaults.bool(forKey: enabledKey)
        }
        requestAuthorization()
    }

    func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    func scheduleReminders(for elapsed: TimeInterval, isRunning: Bool) {
        guard remindersEnabled, isRunning else {
            cancelReminders()
            return
        }

        let interval = TimeInterval(reminderIntervalMinutes * 60)
        guard interval > 0 else { return }

        cancelReminders()

        let nextBoundary = ceil(elapsed / interval) * interval
        var fireAt = nextBoundary
        if fireAt <= elapsed {
            fireAt += interval
        }

        for index in 0..<8 {
            let triggerSeconds = fireAt - elapsed + TimeInterval(index) * interval
            guard triggerSeconds >= 1 else { continue }

            let totalAtFire = elapsed + triggerSeconds
            let content = UNMutableNotificationContent()
            content.title = "工作提醒"
            content.body = "你已经工作了 \(WorkSessionManager.format(totalAtFire))，记得休息一下。"
            content.sound = .default

            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: triggerSeconds, repeats: false)
            let request = UNNotificationRequest(
                identifier: "\(reminderPrefix)\(index)",
                content: content,
                trigger: trigger
            )
            UNUserNotificationCenter.current().add(request)
        }
    }

    func cancelReminders() {
        let ids = (0..<8).map { "\(reminderPrefix)\($0)" }
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ids)
    }
}
