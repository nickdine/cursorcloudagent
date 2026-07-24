import Combine
import Foundation

@MainActor
final class WorkSessionManager: ObservableObject {
    enum State: String, Codable {
        case idle
        case working
        case paused
    }

    @Published private(set) var state: State = .idle
    @Published private(set) var elapsedSeconds: TimeInterval = 0

    private var timer: Timer?
    private var sessionStartDate: Date?
    private var accumulatedSeconds: TimeInterval = 0

    private let defaults = UserDefaults.standard
    private let stateKey = "workTimer.state"
    private let accumulatedKey = "workTimer.accumulated"
    private let sessionStartKey = "workTimer.sessionStart"
    private let lastActiveDayKey = "workTimer.lastActiveDay"

    var isRunning: Bool { state == .working }

    init() {
        restore()
        maybeResetForNewDay()
        if state == .working {
            recalculateElapsed()
            startTimer()
        }
    }

    func start() {
        guard state != .working else { return }
        state = .working
        sessionStartDate = Date()
        persist()
        recalculateElapsed()
        startTimer()
    }

    func pause() {
        guard state == .working else { return }
        stopTimer()
        if let start = sessionStartDate {
            accumulatedSeconds += Date().timeIntervalSince(start)
        }
        sessionStartDate = nil
        state = .paused
        elapsedSeconds = accumulatedSeconds
        persist()
    }

    func resume() {
        guard state == .paused else { return }
        state = .working
        sessionStartDate = Date()
        persist()
        startTimer()
    }

    func stop() {
        stopTimer()
        state = .idle
        sessionStartDate = nil
        accumulatedSeconds = 0
        elapsedSeconds = 0
        persist()
    }

    func toggle() {
        switch state {
        case .idle:
            start()
        case .working:
            pause()
        case .paused:
            resume()
        }
    }

    static func format(_ interval: TimeInterval) -> String {
        let total = max(0, Int(interval))
        let hours = total / 3600
        let minutes = (total % 3600) / 60
        let seconds = total % 60
        if hours > 0 {
            return String(format: "%d 小时 %02d 分 %02d 秒", hours, minutes, seconds)
        }
        if minutes > 0 {
            return String(format: "%d 分 %02d 秒", minutes, seconds)
        }
        return String(format: "%d 秒", seconds)
    }

    static func formatShort(_ interval: TimeInterval) -> String {
        let total = max(0, Int(interval))
        let hours = total / 3600
        let minutes = (total % 3600) / 60
        if hours > 0 {
            return String(format: "%d:%02d", hours, minutes)
        }
        return String(format: "%d:%02d", minutes, total % 60)
    }

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
        if let timer {
            RunLoop.main.add(timer, forMode: .common)
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func tick() {
        recalculateElapsed()
    }

    private func recalculateElapsed() {
        var total = accumulatedSeconds
        if state == .working, let start = sessionStartDate {
            total += Date().timeIntervalSince(start)
        }
        elapsedSeconds = total
    }

    private func maybeResetForNewDay() {
        let today = Calendar.current.startOfDay(for: Date())
        if let last = defaults.object(forKey: lastActiveDayKey) as? Date {
            let lastDay = Calendar.current.startOfDay(for: last)
            if lastDay < today, state != .idle {
                stop()
            }
        }
        defaults.set(today, forKey: lastActiveDayKey)
    }

    private func persist() {
        defaults.set(state.rawValue, forKey: stateKey)
        defaults.set(accumulatedSeconds, forKey: accumulatedKey)
        defaults.set(sessionStartDate, forKey: sessionStartKey)
    }

    private func restore() {
        if let raw = defaults.string(forKey: stateKey),
           let restored = State(rawValue: raw) {
            state = restored
        }
        accumulatedSeconds = defaults.double(forKey: accumulatedKey)
        sessionStartDate = defaults.object(forKey: sessionStartKey) as? Date
        recalculateElapsed()
    }
}
