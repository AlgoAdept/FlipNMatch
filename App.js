import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure your CSS changes are here

const colorSets = {
  easy: ["#FF5733", "#33FF57", "#3357FF", "#FF33A1"],
  medium: [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
    "#A133FF", "#33FFF6", "#FFEB33", "#FFB933"
  ],
  hard: [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1",
    "#A133FF", "#33FFF6", "#F4FF33", "#FFB933",
    "#FF3333", "#33FF9D", "#9D33FF", "#FF33F5"
  ]
};

function App() {
  const [gameStage, setGameStage] = useState("selection");
  const [level, setLevel] = useState("medium"); 
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]); 
  const [matchedCards, setMatchedCards] = useState([]); 
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (gameStage === "playing") {
      const selectedColors = colorSets[level];
      const doubledColors = [...selectedColors, ...selectedColors];
      const shuffledColors = doubledColors.sort(() => Math.random() - 0.5);
      const initializedCards = shuffledColors.map((color, index) => ({
        color,
        id: index,
        flipped: false,
        matched: false
      }));
      setCards(initializedCards);
    }
  }, [gameStage, level]);

  useEffect(() => {
    let interval = null;
    if (gameStage === "playing") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setIntervalId(interval);
    }
    return () => clearInterval(interval);
  }, [gameStage]);

  useEffect(() => {
    if (matchedCards.length === colorSets[level].length) {
      setGameStage("finished");
      clearInterval(intervalId);
    }
  }, [matchedCards, level, intervalId]);

  const handleCardClick = (card) => {
    if (flippedCards.length === 2 || card.flipped || card.matched) return;

    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);
    setCards(cards.map(c => c.id === card.id ? { ...c, flipped: true } : c));
    setMoves(moves + 1);

    if (newFlippedCards.length === 2) {
      const [firstCard, secondCard] = newFlippedCards;
      if (firstCard.color === secondCard.color) {
        setMatchedCards([...matchedCards, firstCard.color]);
        setCards(prevCards =>
          prevCards.map(c =>
            c.color === firstCard.color ? { ...c, matched: true } : c
          )
        );
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, flipped: false }
                : c
            )
          );
        }, 1000);
      }
      setFlippedCards([]);
    }
  };

  const restartGame = () => {
    setGameStage("selection");
    setLevel("easy");
    setCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimer(0);
    clearInterval(intervalId);
  };

  return (
    <div className="App">
      {gameStage === "selection" && (
        <div className="selection-screen">
          <h1>Memory Card Game</h1>
          <p>Select Difficulty Level:</p>
          <div className="buttons">
            <button onClick={() => { setLevel("easy"); setGameStage("playing"); }}>Easy</button>
            <button onClick={() => { setLevel("medium"); setGameStage("playing"); }}>Medium</button>
            <button onClick={() => { setLevel("hard"); setGameStage("playing"); }}>Hard</button>
          </div>
        </div>
      )}

      {gameStage === "playing" && (
        <>
          <div className="info">
            <p>Moves: {moves}</p>
            <p>Time: {timer}s</p>
          </div>
          <div className={`cards-container ${level}`}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`card ${card.flipped || card.matched ? 'flipped' : ''}`}
                onClick={() => handleCardClick(card)}
              >
                <div className="card-inner">
                  <div className="card-front"></div>
                  <div className="card-back" style={{ backgroundColor: card.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {gameStage === "finished" && (
        <div className="game-over">
          <h2>Congratulations!</h2>
          <p>You completed the game.</p>
          <p>Moves: {moves}</p>
          <p>Time: {timer}s</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default App;
