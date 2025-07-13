import React, { useState, useEffect, useCallback } from "react";
import Card from "./components/Card";
import { COLORS } from "./data/colors";
import confetti from "canvas-confetti";
import "./App.css";

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

/* grid spec (no blanks) */
const GRID = {
  Easy:   { cols: 4, pairs:  6 },   // 12 cards
  Medium: { cols: 6, pairs: 12 },   // 24 cards
  Hard:   { cols: 8, pairs: 16 }    // 32 cards
};

/* localStorage helpers */
const STORAGE_KEY = "flipnmatch-scores";
const loadScores  = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const saveScores  = (obj) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));

export default function App() {
  /* board state */
  const [deck, setDeck]       = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [difficulty, setDifficulty] = useState("Medium");

  /* score state */
  const [flipCount, setFlipCount]     = useState(0);
  const [bestScores, setBestScores]   = useState(loadScores());

  /* (re)deal color pairs */
  const resetGame = useCallback(() => {
    const { pairs } = GRID[difficulty];
    const shades = shuffle(COLORS).slice(0, pairs);
    setDeck(shuffle([...shades, ...shades]));
    setFlipped([]);
    setMatched(new Set());
    setFlipCount(0);
  }, [difficulty]);

  useEffect(() => resetGame(), [resetGame]);

  /* flip logic + high‑score update */
  const handleFlip = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.has(idx))
      return;

    setFlipCount((n) => n + 1);
    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        const newMatched = new Set([...matched, a, b]);
        setMatched(newMatched);
        setTimeout(() => setFlipped([]), 350);

        /* check winning condition & update best */
        if (newMatched.size === GRID[difficulty].pairs * 2) {
          const currentBest = bestScores[difficulty] ?? Infinity;
          const flipsUsed   = flipCount + 1; // +1 for this flip
          if (flipsUsed < currentBest) {
            const updated = { ...bestScores, [difficulty]: flipsUsed };
            setBestScores(updated);
            saveScores(updated);
          }
          confetti({
  particleCount: 180,
  spread: 100,
  angle: 90,
  origin: { y: 0.2 },
  colors: ['#00e5ff', '#ffd60a', '#ff4081', '#64dd17']
});
        }
      } else {
        setTimeout(() => setFlipped([]), 750);
      }
    }
  };

  const { cols } = GRID[difficulty];
  const won = matched.size === GRID[difficulty].pairs * 2;

  return (
    <main className="wrapper">
      <h1>🧠 Flip N Match</h1>

      {/* difficulty picker */}
      <div className="difficulty">
        {Object.keys(GRID).map((lvl) => (
          <button
            key={lvl}
            className={`level-btn ${difficulty === lvl ? "active" : ""}`}
            onClick={() => setDifficulty(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* live stats */}
      <p className="stats">
        Flips: {flipCount} &nbsp;|&nbsp; Best ({difficulty}):{" "}
        {bestScores[difficulty] ?? "—"}
      </p>

      <button className="reset" onClick={resetGame}>🔄 Reset</button>

      {/* card grid */}
      <section
        className="grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {deck.map((color, idx) => (
          <Card
            key={idx}
            color={color}
            show={flipped.includes(idx) || matched.has(idx)}
            onClick={() => handleFlip(idx)}
          />
        ))}
      </section>

      {won && <p className="win">You nailed it! 🎉</p>}
    </main>
  );
}
