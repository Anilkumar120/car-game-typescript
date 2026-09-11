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

  const enemyIdRef = useRef(0);
  const roadRef = useRef<HTMLDivElement>(null);

  // =====================================
  // MOVE PLAYER LEFT
  // =====================================

  const moveLeft = () => {
    if (gameOver || isPaused) return;

    setCarPosition((position) =>
      Math.max(position - 30, 20)
    );
  };

  // =====================================
  // MOVE PLAYER RIGHT
  // =====================================

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

      // Space = Pause / Resume
      if (event.code === "Space") {
        event.preventDefault();

        if (!gameOver) {
          setIsPaused((oldValue) => !oldValue);
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
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
        lanes[
          Math.floor(
            Math.random() * lanes.length
          )
        ];

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
          .filter((enemy) => enemy.top < 800)
      );
    }, 50);

    return () => {
      clearInterval(moveTimer);
    };
  }, [gameOver, isPaused]);

  // =====================================
  // COLLISION DETECTION
  // =====================================

  useEffect(() => {
    if (gameOver || isPaused) return;

    const road = roadRef.current;

    if (!road) return;

    const player =
      road.querySelector(
        ".player-car"
      ) as HTMLElement | null;

    if (!player) return;

    const playerRect =
      player.getBoundingClientRect();

    enemies.forEach((enemy) => {
      const enemyElement =
        road.querySelector(
          `[data-enemy-id="${enemy.id}"]`
        ) as HTMLElement | null;

      if (!enemyElement) return;

      const enemyRect =
        enemyElement.getBoundingClientRect();

      /*
        Actual visual collision detection.

        Small overlap required so that cars don't
        trigger Game Over too early.
      */

      const padding = 8;

      const collision =
        playerRect.left + padding <
          enemyRect.right - padding &&
        playerRect.right - padding >
          enemyRect.left + padding &&
        playerRect.top + padding <
          enemyRect.bottom - padding &&
        playerRect.bottom - padding >
          enemyRect.top + padding;

      if (collision) {
        setGameOver(true);

        setLastScore(score);

        setBestScore((oldBest) =>
          Math.max(oldBest, score)
        );
      }
    });
  }, [
    enemies,
    score,
    gameOver,
    isPaused,
  ]);

  // =====================================
  // RESTART GAME
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
  // PAUSE / RESUME
  // =====================================

  const togglePause = () => {
    if (gameOver) return;

    setIsPaused((oldValue) => !oldValue);
  };

  // =====================================
  // MOBILE LEFT BUTTON
  // =====================================

  const startMovingLeft = () => {
    if (gameOver || isPaused) return;

    moveLeft();
  };

  // =====================================
  // MOBILE RIGHT BUTTON
  // =====================================

  const startMovingRight = () => {
    if (gameOver || isPaused) return;

    moveRight();
  };

  // =====================================
  // JSX
  // =====================================

  return (
    <div className="game">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="game-header">

        <h1>🏎️ Car Racing Game</h1>

        {/* SCORE BOARD */}

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

        {/* GAME BUTTONS */}

        <div className="controls">

          <button
            onClick={togglePause}
          >
            {isPaused
              ? "▶ Resume"
              : "⏸ Pause"}
          </button>

          <button
            onClick={restartGame}
          >
            🔄 Restart
          </button>

        </div>

      </div>

      {/* =====================================
          GAME AREA
      ===================================== */}

      <div className="game-wrapper">

        <div
          className="road"
          ref={roadRef}
        >

          {/* ROAD LINE 1 */}

          <div
            className={`road-line line-1 ${
              isPaused ? "paused" : ""
            }`}
          />

          {/* ROAD LINE 2 */}

          <div
            className={`road-line line-2 ${
              isPaused ? "paused" : ""
            }`}
          />

          {/* =====================================
              ENEMY CARS
          ===================================== */}

          {enemies.map((enemy) => (

            <div
              key={enemy.id}
              className="enemy-car"
              data-enemy-id={enemy.id}
              style={{
                left: `${enemy.lane}%`,
                top: `${enemy.top}px`,
              }}
            >
              🚙
            </div>

          ))}

          {/* =====================================
              PLAYER CAR
          ===================================== */}

          <div
            className="player-car"
            style={{
              left: `${carPosition}%`,
            }}
          >
            🚗
          </div>

          {/* =====================================
              PAUSE SCREEN
          ===================================== */}

          {isPaused && !gameOver && (

            <div className="pause-screen">

              <h2>
                ⏸ GAME PAUSED
              </h2>

              <p>
                Press Resume to continue
              </p>

            </div>

          )}

          {/* =====================================
              GAME OVER
          ===================================== */}

          {gameOver && (

            <div className="game-over">

              <h2>
                💥 GAME OVER
              </h2>

              <p>
                Your Score:
                <strong>
                  {lastScore}
                </strong>
              </p>

              <p>
                Best Score:
                <strong>
                  {bestScore}
                </strong>
              </p>

              <button
                onClick={restartGame}
              >
                🔄 Play Again
              </button>

            </div>

          )}

        </div>

      </div>

      {/* =====================================
          MOBILE CONTROLS
      ===================================== */}

      <div className="mobile-controls">

        <button
          className="direction-btn"
          onPointerDown={
            startMovingLeft
          }
        >
          ⬅️
        </button>

        <button
          className="direction-btn"
          onPointerDown={
            startMovingRight
          }
        >
          ➡️
        </button>

      </div>

      {/* =====================================
          INSTRUCTIONS
      ===================================== */}

      <div className="instructions">

        <span className="desktop-instruction">
          ⬅️ Left Arrow
          &nbsp;&nbsp;
          ➡️ Right Arrow
        </span>

        <span className="mobile-instruction">
          👆 Use buttons to move
        </span>

      </div>

    </div>
  );
}

export default App;