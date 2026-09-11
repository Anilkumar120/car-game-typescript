import { useEffect, useRef, useState } from "react";
import "./App.css";

type EnemyCar = {
  id: number;
  lane: number;
  top: number;
};

const lanes = [20, 50, 80];

function App() {
  const [carPosition, setCarPosition] = useState(50);
  const [enemies, setEnemies] = useState<EnemyCar[]>([]);
  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Enemy ID ko state ki jagah ref mein rakha hai
  const enemyIdRef = useRef(0);

  // =====================================
  // MOVE PLAYER
  // =====================================

  const moveLeft = () => {
    if (gameOver || isPaused) return;

    setCarPosition((position) =>
      Math.max(position - 30, 20)
    );
  };

  const moveRight = () => {
    if (gameOver || isPaused) return;

    setCarPosition((position) =>
      Math.min(position + 30, 80)
    );
  };

  // =====================================
  // KEYBOARD CONTROLS
  // =====================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLeft();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveRight();
      }

      // Space = Pause
      if (event.code === "Space") {
        event.preventDefault();

        if (!gameOver) {
          setIsPaused((oldValue) => !oldValue);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, isPaused]);

  // =====================================
  // SCORE
  // =====================================

  useEffect(() => {
    if (gameOver || isPaused) return;

    const timer = setInterval(() => {
      setScore((oldScore) => oldScore + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameOver, isPaused]);

  // =====================================
  // CREATE ENEMY CARS
  // =====================================

  useEffect(() => {
    if (gameOver || isPaused) return;

    const enemyTimer = setInterval(() => {
      const randomLane =
        lanes[Math.floor(Math.random() * lanes.length)];

      enemyIdRef.current += 1;

      const newEnemy: EnemyCar = {
        id: enemyIdRef.current,
        lane: randomLane,
        top: -100,
      };

      setEnemies((oldEnemies) => [
        ...oldEnemies,
        newEnemy,
      ]);
    }, 1200);

    return () => {
      clearInterval(enemyTimer);
    };
  }, [gameOver, isPaused]);

  // =====================================
  // MOVE ENEMY CARS
  // =====================================

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveTimer = setInterval(() => {
      setEnemies((oldEnemies) =>
        oldEnemies
          .map((enemy) => ({
            ...enemy,
            top: enemy.top + 8,
          }))
          .filter((enemy) => enemy.top < 700)
      );
    }, 50);

    return () => {
      clearInterval(moveTimer);
    };
  }, [gameOver, isPaused]);

  // =====================================
  // COLLISION
  // =====================================

  useEffect(() => {
    if (gameOver || isPaused) return;

    enemies.forEach((enemy) => {
      const sameLane =
        Math.abs(enemy.lane - carPosition) < 10;

      const touchingPlayer =
        enemy.top > 450 &&
        enemy.top < 570;

      if (sameLane && touchingPlayer) {
        setGameOver(true);

        setLastScore(score);

        setBestScore((oldBest) =>
          Math.max(oldBest, score)
        );
      }
    });
  }, [
    enemies,
    carPosition,
    score,
    gameOver,
    isPaused,
  ]);

  // =====================================
  // RESTART
  // =====================================

  const restartGame = () => {
    setCarPosition(50);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);

    enemyIdRef.current = 0;
  };

  // =====================================
  // PAUSE
  // =====================================

  const togglePause = () => {
    if (gameOver) return;

    setIsPaused((oldValue) => !oldValue);
  };

  // =====================================
  // TOUCH HOLD SUPPORT
  // =====================================

  const startMovingLeft = () => {
    if (gameOver || isPaused) return;

    moveLeft();
  };

  const startMovingRight = () => {
    if (gameOver || isPaused) return;

    moveRight();
  };

  return (
    <div className="game">

      {/* HEADER */}

      <div className="game-header">

        <h1>🏎️ Car Racing Game</h1>

        <div className="score-board">

          <div>
            Score
            <strong>{score}</strong>
          </div>

          <div>
            Last Score
            <strong>{lastScore}</strong>
          </div>

          <div>
            Best
            <strong>{bestScore}</strong>
          </div>

        </div>

        <div className="controls">

          <button onClick={togglePause}>
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>

          <button onClick={restartGame}>
            🔄 Restart
          </button>

        </div>

      </div>

      {/* GAME AREA */}

      <div className="game-wrapper">

        <div className="road">

          {/* ROAD LINES */}

          <div
            className={`road-line line-1 ${
              isPaused ? "paused" : ""
            }`}
          />

          <div
            className={`road-line line-2 ${
              isPaused ? "paused" : ""
            }`}
          />

          {/* ENEMY CARS */}

          {enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="enemy-car"
              style={{
                left: `${enemy.lane}%`,
                top: `${enemy.top}px`,
              }}
            >
              🚙
            </div>
          ))}

          {/* PLAYER CAR */}

          <div
            className="player-car"
            style={{
              left: `${carPosition}%`,
            }}
          >
            🚗
          </div>

          {/* PAUSE */}

          {isPaused && !gameOver && (
            <div className="pause-screen">

              <h2>⏸ GAME PAUSED</h2>

              <p>
                Press Resume to continue
              </p>

            </div>
          )}

          {/* GAME OVER */}

          {gameOver && (
            <div className="game-over">

              <h2>💥 GAME OVER</h2>

              <p>
                Your Score:
                <strong>{lastScore}</strong>
              </p>

              <p>
                Best Score:
                <strong>{bestScore}</strong>
              </p>

              <button onClick={restartGame}>
                🔄 Play Again
              </button>

            </div>
          )}

        </div>

      </div>

      {/* MOBILE CONTROLS */}

      <div className="mobile-controls">

        <button
          className="direction-btn"
          onPointerDown={startMovingLeft}
        >
          ⬅️
        </button>

        <button
          className="direction-btn"
          onPointerDown={startMovingRight}
        >
          ➡️
        </button>

      </div>

      <div className="instructions">

        <span className="desktop-instruction">
          ⬅️ Left Arrow &nbsp;&nbsp; ➡️ Right Arrow
        </span>

        <span className="mobile-instruction">
          👆 Use buttons to move
        </span>

      </div>

    </div>
  );
}

export default App;

