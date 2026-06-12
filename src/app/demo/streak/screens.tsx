import { useState } from "react";
import { Icon, StreakRing, Heatmap, WeekBars } from "./ui";
import {
  type Habit,
  type IconKey,
  suggestions,
  accentChoices,
  cadenceChoices,
} from "./data";

const DEMO_DATE = "Tuesday, 12 March";

/* ---------------------------- Onboarding ---------------------------- */

export function Onboarding({
  onStart,
}: {
  onStart: (picked: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(["s-meditate", "s-water"]);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="st-screen">
      <div className="st-scroll" style={{ paddingTop: 40 }}>
        <div className="st-rise">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--st-accent)",
            }}
          >
            <Icon name="flame" size={26} />
            <span className="st-display" style={{ fontSize: "1.5rem" }}>
              Streak
            </span>
          </div>
          <h1
            className="st-display"
            style={{ fontSize: "2.3rem", marginTop: 28, maxWidth: 320 }}
          >
            Build a streak, one day at a time.
          </h1>
          <p
            className="st-body"
            style={{ color: "var(--st-ink-2)", marginTop: 14, maxWidth: 300 }}
          >
            Pick a few habits to begin. You can change these any time.
          </p>
        </div>

        <div
          className="st-rise"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 30,
            animationDelay: "0.06s",
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s.id}
              className="st-chip"
              data-on={picked.includes(s.id)}
              onClick={() => toggle(s.id)}
            >
              <span className="st-chip-ic">
                <Icon name={s.icon} size={16} />
              </span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 20px 24px" }}>
        <button
          className="st-btn st-btn-primary st-btn-block"
          disabled={picked.length === 0}
          onClick={() => onStart(picked)}
        >
          Start tracking
          {picked.length > 0 ? ` (${picked.length})` : ""}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Home ------------------------------- */

export function HomeScreen({
  habits,
  onToggle,
  onOpen,
}: {
  habits: Habit[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const done = habits.filter((h) => h.doneToday).length;
  const total = habits.length;
  const ratio = total ? done / total : 0;

  return (
    <div className="st-screen">
      <div className="st-topbar">
        <div>
          <div className="st-eyebrow">{DEMO_DATE}</div>
          <div className="st-display" style={{ fontSize: "1.5rem", marginTop: 2 }}>
            Good morning
          </div>
        </div>
        <button className="st-iconbtn" aria-label="Notifications">
          <Icon name="bell" size={20} />
        </button>
      </div>

      <div className="st-scroll">
        {/* Hero progress card */}
        <div
          className="st-card st-rise"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: 20,
          }}
        >
          <StreakRing value={ratio} size={120} stroke={11}>
            <div className="st-display" style={{ fontSize: "1.7rem" }}>
              {done}
              <span style={{ color: "var(--st-ink-3)", fontSize: "1rem" }}>
                /{total}
              </span>
            </div>
            <div
              style={{ fontSize: "0.66rem", color: "var(--st-ink-3)", fontWeight: 600 }}
            >
              TODAY
            </div>
          </StreakRing>
          <div>
            <div className="st-display" style={{ fontSize: "1.25rem" }}>
              {done === total ? "All done. Nice." : "Keep it going"}
            </div>
            <p
              className="st-body"
              style={{ color: "var(--st-ink-2)", fontSize: "0.88rem", marginTop: 4 }}
            >
              {done === total
                ? "Every habit checked off today."
                : `${total - done} habit${total - done > 1 ? "s" : ""} left for today.`}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "24px 2px 12px",
          }}
        >
          <div className="st-eyebrow">Today</div>
          <div className="st-eyebrow">{done} done</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {habits.map((h, i) => (
            <div
              key={h.id}
              className="st-habit st-rise"
              style={{ animationDelay: `${0.04 * i}s` }}
            >
              <span className="st-habit-ic">
                <Icon name={h.icon} size={22} />
              </span>
              <button
                onClick={() => onOpen(h.id)}
                style={{ flex: 1, textAlign: "left", background: "none" }}
              >
                <div className="st-habit-name">{h.name}</div>
                <div className="st-habit-sub">
                  <Icon name="flame" size={13} />
                  {h.streak} day{h.streak === 1 ? "" : "s"} · {h.cadence}
                </div>
              </button>
              <button
                className="st-check"
                data-on={h.doneToday}
                aria-label={h.doneToday ? "Mark not done" : "Mark done"}
                onClick={() => onToggle(h.id)}
              >
                <Icon name="check" size={18} stroke={3} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Detail ------------------------------ */

export function DetailScreen({
  habit,
  onBack,
  onToggle,
}: {
  habit: Habit;
  onBack: () => void;
  onToggle: (id: string) => void;
}) {
  const completion = Math.round(
    (habit.history.filter(Boolean).length / habit.history.length) * 100
  );
  const total = habit.history.filter(Boolean).length;

  return (
    <div className="st-screen">
      <div className="st-topbar">
        <button className="st-iconbtn" aria-label="Back" onClick={onBack}>
          <Icon name="back" size={20} />
        </button>
        <button className="st-iconbtn" aria-label="Settings">
          <Icon name="settings" size={19} />
        </button>
      </div>

      <div className="st-scroll">
        <div className="st-rise" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="st-habit-ic" style={{ width: 56, height: 56, borderRadius: 18 }}>
            <Icon name={habit.icon} size={28} />
          </span>
          <div>
            <h1 className="st-display" style={{ fontSize: "1.7rem" }}>
              {habit.name}
            </h1>
            <div className="st-habit-sub">
              <Icon name="calendar" size={13} /> {habit.cadence}
            </div>
          </div>
        </div>

        {/* Streak hero */}
        <div
          className="st-card st-rise"
          style={{
            marginTop: 20,
            padding: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg, var(--st-accent-wash), var(--st-surface))",
            animationDelay: "0.05s",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--st-accent-ink)",
              }}
            >
              <Icon name="flame" size={22} />
              <span className="st-eyebrow" style={{ color: "var(--st-accent-ink)" }}>
                Current streak
              </span>
            </div>
            <div
              className="st-display"
              style={{ fontSize: "3.2rem", color: "var(--st-accent-ink)", marginTop: 2 }}
            >
              {habit.streak}
              <span style={{ fontSize: "1.1rem" }}> days</span>
            </div>
          </div>
          <StreakRing value={Math.min(1, habit.streak / Math.max(habit.best, 1))} size={92} stroke={9}>
            <div style={{ fontSize: "0.62rem", color: "var(--st-ink-3)", fontWeight: 700 }}>
              BEST
            </div>
            <div className="st-display" style={{ fontSize: "1.3rem" }}>
              {habit.best}
            </div>
          </StreakRing>
        </div>

        {/* Heatmap */}
        <div className="st-card st-rise" style={{ marginTop: 14, padding: 18, animationDelay: "0.1s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="st-eyebrow">Last 17 weeks</div>
            <div className="st-eyebrow">{completion}%</div>
          </div>
          <Heatmap history={habit.history} />
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div className="st-card st-stat">
            <div className="st-eyebrow">Completion</div>
            <div className="st-display st-stat-num" style={{ marginTop: 6 }}>
              {completion}%
            </div>
          </div>
          <div className="st-card st-stat">
            <div className="st-eyebrow">Total days</div>
            <div className="st-display st-stat-num" style={{ marginTop: 6 }}>
              {total}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 24px" }}>
        <button
          className="st-btn st-btn-block"
          onClick={() => onToggle(habit.id)}
          style={
            habit.doneToday
              ? { background: "var(--st-success-wash)", color: "var(--st-success)" }
              : { background: "var(--st-accent)", color: "#fff" }
          }
        >
          <Icon name="check" size={18} stroke={3} />
          {habit.doneToday ? "Done today" : "Mark done today"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Add ------------------------------- */

export function AddScreen({
  onCreate,
  onCancel,
  onAccent,
  accent,
}: {
  onCreate: (h: { name: string; icon: IconKey; cadence: string }) => void;
  onCancel: () => void;
  onAccent: (value: string) => void;
  accent: string;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconKey>("sun");
  const [cadence, setCadence] = useState(cadenceChoices[0]);
  const [reminder, setReminder] = useState(true);

  const iconKeys: IconKey[] = [
    "sun",
    "water",
    "run",
    "book",
    "meditate",
    "sleep",
    "stretch",
    "write",
  ];

  return (
    <div className="st-screen">
      <div className="st-topbar">
        <button className="st-iconbtn" aria-label="Cancel" onClick={onCancel}>
          <Icon name="back" size={20} />
        </button>
        <div className="st-eyebrow">New habit</div>
        <span style={{ width: 40 }} />
      </div>

      <div className="st-scroll">
        <label className="st-eyebrow" htmlFor="hname">
          Name
        </label>
        <input
          id="hname"
          className="st-input"
          placeholder="e.g. Morning light"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginTop: 8 }}
        />

        <div className="st-eyebrow" style={{ marginTop: 22 }}>
          Icon
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginTop: 10,
          }}
        >
          {iconKeys.map((k) => (
            <button
              key={k}
              onClick={() => setIcon(k)}
              className="st-habit-ic"
              style={{
                width: "100%",
                height: 54,
                borderRadius: 16,
                background: icon === k ? "var(--st-accent)" : "var(--st-surface-2)",
                color: icon === k ? "#fff" : "var(--st-ink-2)",
                border: "1px solid var(--st-line)",
              }}
            >
              <Icon name={k} size={22} />
            </button>
          ))}
        </div>

        <div className="st-eyebrow" style={{ marginTop: 22 }}>
          Colour
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {accentChoices.map((a) => (
            <button
              key={a.id}
              aria-label={a.label}
              className="st-swatch"
              data-on={accent === a.value}
              style={{ background: a.value }}
              onClick={() => onAccent(a.value)}
            />
          ))}
        </div>

        <div className="st-eyebrow" style={{ marginTop: 22 }}>
          Repeat
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {cadenceChoices.map((c) => (
            <button
              key={c}
              className="st-chip"
              data-on={cadence === c}
              onClick={() => setCadence(c)}
              style={{ paddingLeft: 15 }}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          className="st-card"
          onClick={() => setReminder((r) => !r)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            marginTop: 22,
            textAlign: "left",
          }}
        >
          <span className="st-habit-ic" style={{ width: 40, height: 40 }}>
            <Icon name="bell" size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div className="st-habit-name" style={{ fontSize: "0.92rem" }}>
              Daily reminder
            </div>
            <div className="st-habit-sub">8:00 AM</div>
          </div>
          <span
            style={{
              width: 44,
              height: 26,
              borderRadius: 999,
              background: reminder ? "var(--st-accent)" : "var(--st-surface-2)",
              position: "relative",
              transition: "background 0.18s var(--st-ease)",
              flex: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: reminder ? 21 : 3,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "left 0.18s var(--st-ease)",
              }}
            />
          </span>
        </button>
      </div>

      <div style={{ padding: "12px 20px 24px" }}>
        <button
          className="st-btn st-btn-primary st-btn-block"
          disabled={!name.trim()}
          onClick={() => onCreate({ name: name.trim() || "New habit", icon, cadence })}
        >
          Create habit
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Stats ------------------------------ */

export function StatsScreen({ habits }: { habits: Habit[] }) {
  const active = habits.length;
  const longest = Math.max(0, ...habits.map((h) => h.best));
  const weekRatio =
    habits.length === 0
      ? 0
      : habits.reduce(
          (acc, h) => acc + h.history.slice(-7).filter(Boolean).length / 7,
          0
        ) / habits.length;
  // aggregate weekly completion counts (out of active habits)
  const week = [0, 1, 2, 3, 4, 5, 6].map((d) =>
    habits.reduce((acc, h) => acc + (h.history.slice(-7)[d] || 0), 0)
  );

  return (
    <div className="st-screen">
      <div className="st-topbar">
        <div>
          <div className="st-eyebrow">This week</div>
          <div className="st-display" style={{ fontSize: "1.5rem", marginTop: 2 }}>
            Insights
          </div>
        </div>
        <button className="st-iconbtn" aria-label="Settings">
          <Icon name="settings" size={19} />
        </button>
      </div>

      <div className="st-scroll">
        <div
          className="st-card st-rise"
          style={{ display: "flex", alignItems: "center", gap: 20, padding: 22 }}
        >
          <StreakRing value={weekRatio} size={128} stroke={12}>
            <div className="st-display" style={{ fontSize: "1.9rem" }}>
              {Math.round(weekRatio * 100)}%
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--st-ink-3)", fontWeight: 700 }}>
              ON TRACK
            </div>
          </StreakRing>
          <div>
            <div className="st-display" style={{ fontSize: "1.2rem" }}>
              Solid week
            </div>
            <p
              className="st-body"
              style={{ color: "var(--st-ink-2)", fontSize: "0.86rem", marginTop: 4 }}
            >
              You completed most of your habits in the last 7 days.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div className="st-card st-stat">
            <span style={{ color: "var(--st-accent)" }}>
              <Icon name="target" size={20} />
            </span>
            <div className="st-display st-stat-num" style={{ marginTop: 8 }}>
              {active}
            </div>
            <div className="st-eyebrow" style={{ marginTop: 2 }}>
              Active habits
            </div>
          </div>
          <div className="st-card st-stat">
            <span style={{ color: "var(--st-accent)" }}>
              <Icon name="trophy" size={20} />
            </span>
            <div className="st-display st-stat-num" style={{ marginTop: 8 }}>
              {longest}
            </div>
            <div className="st-eyebrow" style={{ marginTop: 2 }}>
              Longest streak
            </div>
          </div>
        </div>

        <div className="st-card" style={{ marginTop: 14, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="st-eyebrow">Completions this week</div>
            <div className="st-eyebrow">/ {active} a day</div>
          </div>
          <WeekBars data={week} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {[...habits]
            .sort((a, b) => b.streak - a.streak)
            .map((h) => (
              <div key={h.id} className="st-habit">
                <span className="st-habit-ic">
                  <Icon name={h.icon} size={20} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="st-habit-name" style={{ fontSize: "0.92rem" }}>
                    {h.name}
                  </div>
                  <div className="st-habit-sub">
                    <Icon name="flame" size={13} /> {h.streak} day streak
                  </div>
                </div>
                <div className="st-display" style={{ fontSize: "1.1rem", color: "var(--st-ink-2)" }}>
                  {Math.round((h.history.filter(Boolean).length / h.history.length) * 100)}%
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
