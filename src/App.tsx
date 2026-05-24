import { useState } from 'react'
import './App.css'

function calculateWinner(square: Array<string | null>) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (square[a] && square[a] === square[b] && square[a] === square[c]) {
      return square[a]
    }
  }

  return null;
}


function App() {

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  let statusMessage;
  if (winner) {
    statusMessage = `Winner: ${winner}`;
  }
  else if (isDraw) {
    statusMessage = "It's a draw!";
  }
  else {
    statusMessage = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <>
      <h1>Tic Tac Toe</h1>
      <div>
        <h2>{statusMessage}</h2>
        <div className="grid grid-cols-3 gap-2 w-fit mb-4">
          {board.map((square, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="w-16 h-16 text-2xl border-2 border-black flex items-center justify-center bg-gray-100"
            >
              {square}
            </button>
          ))}
        </div>
        <button onClick={resetGame}>
          Reset Game
        </button>
      </div>

    </>
  )
}

export default App
