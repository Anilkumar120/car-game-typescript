import { useEffect, useState } from "react";
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

  const [enemyId, setEnemyId] = useState(0);

  // -------------------------
  // PLAYER CAR MOVEMENT
  // -------------------------

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver || isPaused) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setCarPosition((position) =>
          Math.max(position - 30, 20)
        );
      }

      if (event.key === "ArrowRight") {
        setCarPosition((position) =>
          Math.min(position + 30, 80)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameOver, isPaused]);

  // -------------------------
  // SCORE
  // -------------------------

  useEffect(() => {
    if (gameOver || isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setScore((oldScore) => oldScore + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameOver, isPaused]);

  // -------------------------
  // CREATE ENEMY CARS
  // -------------------------

  useEffect(() => {
    if (gameOver || isPaused) {
      return;
    }

    const enemyTimer = setInterval(() => {
      const randomLane =
        lanes[Math.floor(Math.random() * lanes.length)];

      setEnemyId((oldId) => oldId + 1);

      setEnemies((oldEnemies) => [
        ...oldEnemies,
        {
          id: enemyId,
          lane: randomLane,
          top: -100,
        },
      ]);
    }, 1200);

    return () => {
      clearInterval(enemyTimer);
    };
  }, [gameOver, isPaused, enemyId]);

  // -------------------------
  // MOVE ENEMY CARS
  // -------------------------

  useEffect(() => {
    if (gameOver || isPaused) {
      return;
    }

    const moveTimer = setInterval(() => {
      setEnemies((oldEnemies) =>
        oldEnemies
          .map((enemy) => ({
            ...enemy,
            top: enemy.top + 8,
          }))
          .filter((enemy) => enemy.top < 650)
      );
    }, 50);

    return () => {
      clearInterval(moveTimer);
    };
  }, [gameOver, isPaused]);

  // -------------------------
  // COLLISION DETECTION
  // -------------------------

  useEffect(() => {
    if (gameOver || isPaused) {
      return;
    }

    enemies.forEach((enemy) => {
      const sameLane =
        Math.abs(enemy.lane - carPosition) < 10;

      const touchingPlayer =
        enemy.top > 470 &&
        enemy.top < 570;

      if (sameLane && touchingPlayer) {
        setGameOver(true);

        setLastScore(score);

        if (score > bestScore) {
          setBestScore(score);
        }
      }
    });
  }, [
    enemies,
    carPosition,
    score,
    gameOver,
    isPaused,
    bestScore,
  ]);

  // -------------------------
  // RESTART GAME
  // -------------------------

  const restartGame = () => {
    setCarPosition(50);

    setEnemies([]);

    setScore(0);

    setGameOver(false);

    setIsPaused(false);

    setEnemyId(0);
  };

  // -------------------------
  // PAUSE / RESUME
  // -------------------------

  const togglePause = () => {
    if (gameOver) {
      return;
    }

    setIsPaused((oldValue) => !oldValue);
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
            {isPaused ? "▶ Resume" : "⏸ Stop"}
          </button>

          <button onClick={restartGame}>
            🔄 Restart
          </button>

        </div>

      </div>

      {/* GAME */}

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
            <p>Press Resume to continue</p>
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

      <div className="instructions">
        ⬅️ Left Arrow &nbsp;&nbsp; ➡️ Right Arrow
      </div>

    </div>
  );
}

export default App;