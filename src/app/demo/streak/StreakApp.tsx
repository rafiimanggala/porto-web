"use client";

import { useState } from "react";
import { Icon } from "./ui";
import {
  Onboarding,
  HomeScreen,
  DetailScreen,
  AddScreen,
  StatsScreen,
} from "./screens";
import { seedHabits, suggestions, type Habit, type IconKey } from "./data";

type Screen = "onboarding" | "home" | "detail" | "add" | "stats";

const SCREENS: { id: Screen; label: string }[] = [
  { id: "onboarding", label: "Onboard" },
  { id: "home", label: "Today" },
  { id: "detail", label: "Detail" },
  { id: "add", label: "Add" },
  { id: "stats", label: "Insights" },
];

export default function StreakApp() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== "undefined") {
      const s = window.location.search.match(/screen=(\w+)/)?.[1];
      if (s && SCREENS.some((x) => x.id === s)) return s as Screen;
    }
    return "home";
  });
  const [habits, setHabits] = useState<Habit[]>(seedHabits);
  const [selected, setSelected] = useState<string>(seedHabits[0].id);
  const [accent, setAccent] = useState<string>("#ff5a3c");

  const scopeStyle = {
    "--st-accent": accent,
    "--st-accent-wash": `color-mix(in oklab, ${accent} 12%, #fffdf9)`,
    "--st-accent-ink": `color-mix(in oklab, ${accent} 72%, #2a0f06)`,
  } as React.CSSProperties;

  const toggle = (id: string) =>
    setHabits((hs) =>
      hs.map((h) =>
        h.id === id
          ? {
              ...h,
              doneToday: !h.doneToday,
              streak: !h.doneToday ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    );

  const open = (id: string) => {
    setSelected(id);
    setScreen("detail");
  };

  const startFromOnboarding = (picked: string[]) => {
    const map: Record<string, IconKey> = Object.fromEntries(
      suggestions.map((s) => [s.id, s.icon])
    );
    const pickedHabits: Habit[] = picked.map((id) => {
      const s = suggestions.find((x) => x.id === id)!;
      return {
        id: "n-" + id,
        name: s.name,
        icon: map[id],
        cadence: "Every day",
        streak: 0,
        best: 0,
        history: Array(119).fill(0),
        doneToday: false,
      };
    });
    // keep the seeded, lived-in habits for a richer demo, front the picked ones
    const names = new Set(pickedHabits.map((p) => p.name));
    setHabits([...pickedHabits, ...seedHabits.filter((h) => !names.has(h.name))]);
    setScreen("home");
  };

  const createHabit = (h: { name: string; icon: IconKey; cadence: string }) => {
    const nh: Habit = {
      id: "c-" + h.name.toLowerCase().replace(/\s+/g, "-"),
      name: h.name,
      icon: h.icon,
      cadence: h.cadence,
      streak: 0,
      best: 0,
      history: Array(119).fill(0),
      doneToday: false,
    };
    setHabits((hs) => [nh, ...hs]);
    setSelected(nh.id);
    setScreen("home");
  };

  const current = habits.find((h) => h.id === selected) ?? habits[0];
  const showNav = screen === "home" || screen === "stats";

  return (
    <div className="streak-scope" style={scopeStyle}>
      {/* Demo chrome: screen jumper so reviewers can flip the whole flow */}
      <div className="st-demobar">
        <span className="st-eyebrow" style={{ letterSpacing: "0.12em" }}>
          Prototype
        </span>
        <div
          style={{
            display: "inline-flex",
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: "var(--st-surface)",
            border: "1px solid var(--st-line)",
            boxShadow: "var(--st-shadow-sm)",
            flexWrap: "wrap",
          }}
        >
          {SCREENS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              style={{
                padding: "7px 13px",
                borderRadius: 999,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: screen === s.id ? "#fff" : "var(--st-ink-2)",
                background: screen === s.id ? "var(--st-accent)" : "transparent",
                transition: "all 0.16s var(--st-ease)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="st-stage" style={{ paddingTop: 0 }}>
        <div className="st-device">
          {screen === "onboarding" && <Onboarding onStart={startFromOnboarding} />}
          {screen === "home" && (
            <HomeScreen habits={habits} onToggle={toggle} onOpen={open} />
          )}
          {screen === "detail" && (
            <DetailScreen
              habit={current}
              onBack={() => setScreen("home")}
              onToggle={toggle}
            />
          )}
          {screen === "add" && (
            <AddScreen
              onCreate={createHabit}
              onCancel={() => setScreen("home")}
              onAccent={setAccent}
              accent={accent}
            />
          )}
          {screen === "stats" && <StatsScreen habits={habits} />}

          {showNav && (
            <nav className="st-bottomnav">
              <button
                className="st-tab"
                data-on={screen === "home"}
                onClick={() => setScreen("home")}
              >
                <Icon name="home" size={22} />
                Today
              </button>
              <button
                className="st-fab"
                aria-label="Add habit"
                onClick={() => setScreen("add")}
              >
                <Icon name="plus" size={24} stroke={2.4} />
              </button>
              <button
                className="st-tab"
                data-on={screen === "stats"}
                onClick={() => setScreen("stats")}
              >
                <Icon name="stats" size={22} />
                Insights
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
