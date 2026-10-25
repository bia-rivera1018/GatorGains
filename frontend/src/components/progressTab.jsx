export default function ProgressTab({ summary }) {
    const calories = summary?.total_calories ?? 0
    const target = summary?.daily_target ?? 2000
    const remaining = summary?.remaining_calories ?? target

    const percentage = Math.min(
        100,
        Math.max(0, (calories / target) * 100)

    )

    return (
        <section className="panel" aria-labelledby="progress-title">
            <h2 id="progress-title">Your Progress</h2>
            <p className="hint">Track your daily fitness and nutrition goals.</p>

            <div className="progress-grid">
                <div className="progress-card">
                    <h3>Calories Today</h3>
                    <p>{calories} / {target} cal</p>  
            </div>

                <div className="progress-card">
                    <h3>Calories Remaining</h3>
                    <p>{remaining} cal</p>
                </div>
            </div>

            <div
                className="progress-bar"
                role="progressbar"
                aria-label="Daily calorie goal progress"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                >
            <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
            />
    </div>

    <p>{Math.round(percentage)}% of daily calorie target</p>
            <p className="hint">
                Workout and weight progress will appear when those features are available.
            </p>
        </section>
    )
}