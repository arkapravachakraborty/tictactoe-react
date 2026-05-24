import { useState } from 'react'
import './App.css'

interface ConfettiParticle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
}

// Custom winner calculation that also returns the winning line for styling
function calculateWinner(squares: Array<string | null>) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] }
    }
  }

  return null;
}

// AI logic using the Minimax algorithm for unbeatable difficulty
const getBestMove = (tempBoard: Array<string | null>, aiPlayer: string): number => {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';

  const checkWinner = (b: Array<string | null>) => {
    const res = calculateWinner(b);
    if (res) return res.winner;
    if (b.every(s => s !== null)) return 'tie';
    return null;
  };

  const minimax = (currBoard: Array<string | null>, depth: number, isMaximizing: boolean): number => {
    const scoreWinner = checkWinner(currBoard);
    if (scoreWinner === aiPlayer) return 10 - depth;
    if (scoreWinner === opponent) return depth - 10;
    if (scoreWinner === 'tie') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currBoard[i] === null) {
          currBoard[i] = aiPlayer;
          const score = minimax(currBoard, depth + 1, false);
          currBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currBoard[i] === null) {
          currBoard[i] = opponent;
          const score = minimax(currBoard, depth + 1, true);
          currBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (tempBoard[i] === null) {
      tempBoard[i] = aiPlayer;
      const score = minimax(tempBoard, 0, false);
      tempBoard[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

// AI logic for random choice (easy difficulty)
const getEasyMove = (tempBoard: Array<string | null>): number => {
  const availableMoves = tempBoard
    .map((val, idx) => (val === null ? idx : null))
    .filter((val) => val !== null) as number[];

  if (availableMoves.length === 0) return -1;
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

function App() {
  const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [userSymbol, setUserSymbol] = useState<'X' | 'O'>('X');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'impossible'>('impossible');
  const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const gameResult = calculateWinner(board);
  const winner = gameResult?.winner || null;
  const winningLine = gameResult?.line || [];
  const isDraw = !winner && board.every((square) => square !== null);

  const isUserTurn = gameMode === 'pvp' ? true : (userSymbol === 'X' ? isXNext : !isXNext);

  // Confetti trigger
  const triggerConfetti = () => {
    const colors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#d946ef'];
    const particles: ConfettiParticle[] = Array.from({ length: 80 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 4000);
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || isDraw || isAiThinking) {
      return;
    }

    // 1. Human Move
    const playerSymbol = gameMode === 'ai' ? userSymbol : (isXNext ? 'X' : 'O');
    const boardAfterPlayer = [...board];
    boardAfterPlayer[index] = playerSymbol;
    setBoard(boardAfterPlayer);

    const resultAfterPlayer = calculateWinner(boardAfterPlayer);
    const isDrawAfterPlayer = !resultAfterPlayer && boardAfterPlayer.every(square => square !== null);

    if (resultAfterPlayer) {
      setScores((prev) => ({
        ...prev,
        x: resultAfterPlayer.winner === 'X' ? prev.x + 1 : prev.x,
        o: resultAfterPlayer.winner === 'O' ? prev.o + 1 : prev.o,
      }));
      triggerConfetti();
      return;
    }

    if (isDrawAfterPlayer) {
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
      return;
    }

    // Handle PvP transition
    if (gameMode === 'pvp') {
      setIsXNext(!isXNext);
      return;
    }

    // 2. AI Move (if gameMode is 'ai')
    if (gameMode === 'ai') {
      const aiSymbol = userSymbol === 'X' ? 'O' : 'X';
      setIsXNext(aiSymbol === 'X'); // Next is AI's symbol
      setIsAiThinking(true);

      setTimeout(() => {
        let aiMoveIndex: number;

        if (aiDifficulty === 'easy') {
          aiMoveIndex = getEasyMove(boardAfterPlayer);
        } else {
          aiMoveIndex = getBestMove(boardAfterPlayer, aiSymbol);
        }

        if (aiMoveIndex !== -1) {
          const boardAfterAi = [...boardAfterPlayer];
          boardAfterAi[aiMoveIndex] = aiSymbol;
          setBoard(boardAfterAi);

          const resultAfterAi = calculateWinner(boardAfterAi);
          const isDrawAfterAi = !resultAfterAi && boardAfterAi.every(square => square !== null);

          if (resultAfterAi) {
            setScores((prev) => ({
              ...prev,
              x: resultAfterAi.winner === 'X' ? prev.x + 1 : prev.x,
              o: resultAfterAi.winner === 'O' ? prev.o + 1 : prev.o,
            }));
            triggerConfetti();
          } else if (isDrawAfterAi) {
            setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
          }
        }

        setIsAiThinking(false);
        setIsXNext(userSymbol === 'X'); // Back to user's turn
      }, 550); // Small delay to feel premium and realistic
    }
  };

  const triggerAiFirstMove = (currentDifficulty: 'easy' | 'impossible') => {
    setIsAiThinking(true);
    const newBoard = Array(9).fill(null);
    setBoard(newBoard);
    setIsXNext(true); // AI plays as X, so X goes first!
    setConfetti([]);

    setTimeout(() => {
      const aiSymbol = 'X';
      const aiMoveIndex = currentDifficulty === 'easy' ? getEasyMove(newBoard) : getBestMove(newBoard, aiSymbol);
      if (aiMoveIndex !== -1) {
        const boardAfterAi = [...newBoard];
        boardAfterAi[aiMoveIndex] = aiSymbol;
        setBoard(boardAfterAi);
      }
      setIsAiThinking(false);
      setIsXNext(false); // now it is O's turn (user's turn)
    }, 550);
  };

  const resetGame = () => {
    if (gameMode === 'ai' && userSymbol === 'O') {
      triggerAiFirstMove(aiDifficulty);
    } else {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setIsAiThinking(false);
      setConfetti([]);
    }
  };

  const resetScores = () => {
    setScores({ x: 0, o: 0, ties: 0 });
    resetGame();
  };

  const changeGameMode = (mode: 'pvp' | 'ai') => {
    setGameMode(mode);
    if (mode === 'ai' && userSymbol === 'O') {
      triggerAiFirstMove(aiDifficulty);
    } else {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setIsAiThinking(false);
      setConfetti([]);
    }
  };

  const handleSideChange = (side: 'X' | 'O') => {
    setUserSymbol(side);
    if (gameMode === 'ai' && side === 'O') {
      triggerAiFirstMove(aiDifficulty);
    } else {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setIsAiThinking(false);
      setConfetti([]);
    }
  };

  const handleDifficultyChange = (diff: 'easy' | 'impossible') => {
    setAiDifficulty(diff);
    if (gameMode === 'ai' && userSymbol === 'O') {
      triggerAiFirstMove(diff);
    } else {
      setBoard(Array(9).fill(null));
      setIsXNext(true);
      setIsAiThinking(false);
      setConfetti([]);
    }
  };

  return (
    <main className="max-w-[360px] sm:max-w-[390px] w-full glass-panel rounded-3xl p-5 space-y-4 animate-fade-in relative shadow-xl">
      {/* Confetti Container */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '20%',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      {/* Header section with Trophy logo inline */}
      <header className="text-center">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
          <svg className="w-5.5 h-5.5 text-indigo-600 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tic Tac Toe
        </h1>
      </header>

      {/* Mode Controls */}
      <section className="flex flex-col gap-2">
        <div className="flex p-0.5 bg-slate-100/80 rounded-xl glass-card">
          <button
            id="mode-pvp-btn"
            onClick={() => changeGameMode('pvp')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${gameMode === 'pvp'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/10'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Local PvP
          </button>
          <button
            id="mode-ai-btn"
            onClick={() => changeGameMode('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${gameMode === 'ai'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/10'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            VS Computer
          </button>
        </div>

        {/* Dynamic, clean stacked list settings with plenty of horizontal breathing room */}
        {gameMode === 'ai' && (
          <div className="flex flex-col gap-2.5 animate-fade-in bg-slate-50 border border-slate-100/50 p-2.5 rounded-2xl">
            {/* Difficulty Selection */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Difficulty</span>
              <div className="flex p-0.5 bg-slate-200/50 rounded-lg w-44">
                {(['easy', 'impossible'] as const).map((diff) => (
                  <button
                    key={diff}
                    id={`ai-diff-${diff}-btn`}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`flex-1 py-1.5 text-[11px] sm:text-xs font-bold rounded-md capitalize transition-all cursor-pointer ${aiDifficulty === diff
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Side Choosing Selection */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider">Your Symbol</span>
              <div className="flex p-0.5 bg-slate-200/50 rounded-lg w-28">
                {(['X', 'O'] as const).map((side) => (
                  <button
                    key={side}
                    id={`user-side-${side}-btn`}
                    onClick={() => handleSideChange(side)}
                    className={`flex-1 py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all cursor-pointer ${userSymbol === side
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Dynamic Score Board with Integrated Turn Indicators */}
      <section className="grid grid-cols-3 gap-2">
        {/* Player X Card */}
        <div className={`p-2 rounded-xl text-center border-2 transition-all duration-300 ${!winner && !isDraw && isXNext
          ? 'bg-indigo-50/80 border-indigo-200 shadow-xs scale-102 font-bold'
          : 'bg-slate-50/50 border-slate-100/70 text-slate-500'
          }`}>
          <div className="flex items-center justify-center gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500">Player X</span>
            {!winner && !isDraw && isXNext && (
              <span className="w-1 h-1 rounded-full bg-indigo-600 animate-ping"></span>
            )}
          </div>
          <div className={`text-2xl font-black mt-0.5 transition-colors ${!winner && !isDraw && isXNext ? 'text-indigo-700' : 'text-slate-700'}`}>
            {scores.x}
          </div>
        </div>

        {/* Ties Card */}
        <div className="bg-slate-50/30 border-2 border-slate-100/50 p-2 rounded-xl text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ties</div>
          <div className="text-2xl font-black text-slate-700 mt-0.5">{scores.ties}</div>
        </div>

        {/* Player O Card */}
        <div className={`p-2 rounded-xl text-center border-2 transition-all duration-300 ${!winner && !isDraw && !isXNext
          ? 'bg-rose-50/80 border-rose-200 shadow-xs scale-102 font-bold'
          : 'bg-slate-50/50 border-slate-100/70 text-slate-500'
          }`}>
          <div className="flex items-center justify-center gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">Player O</span>
            {!winner && !isDraw && !isXNext && (
              <span className="w-1 h-1 rounded-full bg-rose-600 animate-ping"></span>
            )}
          </div>
          <div className={`text-2xl font-black mt-0.5 transition-colors ${!winner && !isDraw && !isXNext ? 'text-rose-700' : 'text-slate-700'}`}>
            {scores.o}
          </div>
        </div>
      </section>

      {/* Dynamic Status / Game State Banner - Saves massive height */}
      <div className="h-8 flex items-center justify-center w-full">
        {isAiThinking && (
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 bg-slate-100/70 px-3 py-1 rounded-full border border-slate-200/20 animate-pulse">
            <svg className="animate-spin h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI is computing moves...
          </div>
        )}

        {!isAiThinking && (winner || isDraw) && (
          <div className="bg-slate-900 text-white rounded-xl px-4 py-1.2 flex items-center gap-2 shadow-md animate-fade-in">
            {winner ? (
              <>
                <span className="text-xs">🏆</span>
                <span className="font-black text-[9px] uppercase tracking-wider">
                  {winner === 'X' ? 'Player X Wins!' : 'Player O Wins!'}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs">🤝</span>
                <span className="font-black text-[9px] uppercase tracking-wider">It's a Draw!</span>
              </>
            )}
          </div>
        )}

        {!isAiThinking && !winner && !isDraw && (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {gameMode === 'pvp'
              ? `Local PvP • ${isXNext ? "Player X" : "Player O"}'s turn`
              : `VS Computer • ${isUserTurn ? "Your turn" : "Computer's turn"}`
            }
          </span>
        )}
      </div>

      {/* Board Grid */}
      <section className="flex flex-col items-center">
        <div className="grid grid-cols-3 gap-2.5 w-fit">
          {board.map((square, index) => {
            const isWinningCell = winningLine.includes(index);
            let winPulseClass = '';
            if (isWinningCell) {
              winPulseClass = winner === 'X' ? 'animate-win-pulse-x' : 'animate-win-pulse-o';
            }

            return (
              <button
                key={index}
                id={`cell-${index}`}
                onClick={() => handleClick(index)}
                disabled={!!square || !!winner || isDraw || isAiThinking}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center cell-button focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer ${winPulseClass}`}
              >
                {square === 'X' && (
                  <svg className="w-9 h-9 sm:w-11 sm:h-11 text-indigo-600 animate-pop-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {square === 'O' && (
                  <svg className="w-9 h-9 sm:w-11 sm:h-11 text-rose-500 animate-pop-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <circle cx="12" cy="12" r="7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Footer Controls */}
      <footer className="flex items-center gap-2 pt-1">
        <button
          id="play-again-btn"
          onClick={resetGame}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-md shadow-slate-900/10 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
          </svg>
          Reset Board
        </button>
        <button
          id="reset-scores-btn"
          onClick={resetScores}
          title="Reset Scores"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200/50 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </footer>
    </main>
  );
}

export default App;
