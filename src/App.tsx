import React,{ useState, useEffect, useRef } from "react";
import "./App.scss";
let clearCardsTimer = null;
const App = () => {
  const [cards, setCards] = useState([]);
  const [level, setLevel] = useState(1);
  const [levelStart, setLevelStart] = useState(false);
  const [overlayVisibility, setOverlayVisibility] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [cardsWidth, setCardsWidth] = useState('0');

  const cardsContainerRef = useRef(null);
  const resizeObserver = useRef(null);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      calculateCardsWidth();
    });
    if (!!cardsContainerRef.current) {
      resizeObserver.current.observe(cardsContainerRef.current);
    }
    return () => resizeObserver.current.unobserve(cardsContainerRef.current);
  });

  useEffect(() => {
    const info = getLevelInfo(level);
    const initialCards = Array.apply(null, Array(info.count)).map((_, index) => ({
      id: index,
      turned: false,
    }));
    if (level === 1) {
      setCards(initialCards);
    }
    calculateCardsWidth();
  }, [level]);

  const getLevelInfo = (level) => {
    if (level >= 1 && level <= 3) {
      return { count: 9, selected: 3 };
    }
    if (level >= 4 && level <= 6) {
      return { count: 16, selected: 5 };
    }
    if (level >= 7 && level <= 9) {
      return { count: 16, selected: 8 };
    }
    if (level >= 10 && level <= 15) {
      return { count: 25, selected: 10 };
    }
    if (level >= 16 && level <= 25) {
      return { count: 25, selected: 15 };
    }
    if (level >= 26) {
      return { count: 36, selected: 20 };
    }
  };

  const clearCards = () => {
    setCards((preCards) => preCards.map((x) => ({ ...x, turned: false })));
    setLevelStart(true);
  };

  const startLevel = (level) => {
    const selectedCards = [];
    const info = getLevelInfo(level);
    const initialCards = Array.apply(null, Array(info.count)).map((_, index) => ({
      id: index,
      turned: false,
    }));
    const newCards = initialCards.map((x) => ({ ...x, turned: false }));
    while (selectedCards.length < info.selected) {
      let randomNumber = Math.floor(Math.random() * info.count);
      while (selectedCards.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random() * info.count);
      }
      selectedCards.push(randomNumber);
      newCards.find((x) => x.id === randomNumber).turned = true;
    }
    setCards(newCards);
    setSelectedCards(selectedCards);
    setWin(false);
    setOverlayVisibility(false);
    if (!!clearCardsTimer) {
      clearTimeout(clearCardsTimer);
    }
    clearCardsTimer = setTimeout(clearCards, 1000);
  };

  const winCheck = (cards) => {
    if (cards.filter((x) => x.turned === true).length === selectedCards.length) {
      setWin(true);
      setOverlayVisibility(true);
    }
  };

  const showAllSelected = () => {
    const newCards = cards.map((x) => {
      if (selectedCards.includes(x.id)) {
        return { ...x, turned: true };
      }
      return x;
    });
    setCards(newCards);
  };

  const onCardClick = (cardId) => {
    if (levelStart && !gameOver && !win) {
      if (selectedCards.includes(cardId)) {
        const newCards = [...cards];
        newCards.find((x) => x.id === cardId).turned = true;
        setCards(newCards);
        winCheck(newCards);
      } else {
        setGameOver(true);
        setOverlayVisibility(true);
        showAllSelected();
      }
    }
  };

  const resetGame = () => {
    setLevel(1);
    setLevelStart(false);
    setWin(false);
    setGameOver(false);
    setOverlayVisibility(true);
    const newCards = cards.map((x) => ({ ...x, turned: false }));
    setCards(newCards);
  };

  const nextLevel = () => {
    setLevelStart(false);
    setWin(false);
    setOverlayVisibility(false);
    setLevel((level) => {
      const newLevel = level + 1;
      startLevel(newLevel);
      return newLevel;
    });
  };

  const calculateCardsWidth = () => {
    let cardsContainerWidth = 300;
    const levelInfo = getLevelInfo(level);
    const cardsInRow = Math.sqrt(levelInfo.count);
    const margin = 5 * (cardsInRow - 1);

    if (cardsContainerRef.current) {
      cardsContainerWidth = cardsContainerRef.current.clientWidth;
    }
    const width = `${cardsContainerWidth / cardsInRow - margin}px `;

    setCardsWidth(width);
  };

  const cardContainerStyle = () => {
    const levelInfo = getLevelInfo(level);
    const cardsInRow = Math.sqrt(levelInfo.count);

    return { gridTemplateColumns: "auto ".repeat(cardsInRow) };
  };

  return (
    <div className="App">
      {overlayVisibility && (
        <div className="overlay">
          {!gameOver && win && (
            <div className="controlScene">
              <span>&#127881; CONGRATULATION &#127881;</span>
              <button onClick={nextLevel}>NEXT LEVEL &gt;</button>
            </div>
          )}
          {level === 1 && !win && !gameOver && (
            <div className="controlScene">
              <span>&#129300; MEMORIZE THE LOCATION OF THE BLUE CARDS &#129300;</span>
              <button type="button" onClick={() => startLevel(1)}>
                START
              </button>
            </div>
          )}
          {gameOver && (
            <div className="controlScene">
              <span>&#129402; GAME OVER &#129402;</span>
              <span>YOU SELECTE THE WRONG CARD !!!</span>
              <button onClick={resetGame}>RESTART</button>
            </div>
          )}
        </div>
      )}
      <span className="levelText">LEVEL-{level}</span>
      <div style={cardContainerStyle()} className="cardsContainer" ref={cardsContainerRef}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{ height: cardsWidth }}
            onClick={() => onCardClick(card.id)}
            className={`card ${card.turned ? "turned" : ""}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default App;
