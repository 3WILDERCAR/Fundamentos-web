"use client"; 
import { useState } from 'react';

type SquareProps = {
  value: string | null;
  onSquareClick: () => void;
};

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button 
      className={`
        w-24 h-24 text-4xl font-black transition-all duration-200 
        flex items-center justify-center rounded-xl m-1
        ${!value ? 'bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-lg' : 'bg-slate-700 cursor-default'}
        border-b-4 border-slate-900 active:border-b-0
      `}
      onClick={onSquareClick}
    >
      <span className={`
        drop-shadow-md transform transition-transform duration-300 scale-110
        ${value === 'X' ? 'text-cyan-400' : 'text-fuchsia-500'}
      `}>
        {value}
      </span>
    </button>
  );
}

type BoardProps = {
  xIsNext: boolean;
  squares: (string | null)[];
  onPlay: (nextSquares: (string | null)[]) => void;
};

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(s => s !== null);
  
  let status;
  if (winner) {
    status = `🏆 Ganador: ${winner}`;
  } else if (isDraw) {
    status = "🤝 Empate";
  } else {
    status = `Turno de: ${xIsNext ? "X" : "O"}`;
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`
        mb-8 px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl transition-all duration-500
        ${winner ? 'bg-emerald-500 scale-110 animate-bounce' : 'bg-slate-800 border border-slate-700'}
      `}>
        {status}
      </div>
      
      <div className="bg-slate-800/50 p-4 rounded-3xl backdrop-blur-sm border border-slate-700 shadow-2xl">
        <div className="grid grid-cols-3 gap-2">
          {squares.map((sq, i) => (
            <Square key={i} value={sq} onSquareClick={() => handleClick(i)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: (string | null)[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  const moves = history.map((_, move) => {
    const isCurrent = move === currentMove;
    const description = move > 0 ? `Movimiento #${move}` : 'Inicio del juego';
    
    return (
      <li key={move} className="mb-2">
        <button 
          className={`
            w-full px-4 py-2 rounded-xl text-sm font-semibold transition-all
            ${isCurrent 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50 scale-105' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
          `}
          onClick={() => setCurrentMove(move)}
        >
          {description}
        </button>
      </li>
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-12 px-4 selection:bg-cyan-500/30">
      <header className="text-center mb-12">
        <h1 className="text-6xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-600 drop-shadow-sm">
          TOTITO PRO
        </h1>
        <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-xs">Built with Next.js & Tailwind</p>
      </header>

      <main className="flex flex-col lg:flex-row gap-16 items-start">
        <section className="relative">
          {/* Decoración de fondo */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-[40px] opacity-20 blur-2xl -z-10 animate-pulse"></div>
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </section>

        <aside className="w-full lg:w-64 bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
          <h2 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
            Línea de Tiempo
          </h2>
          <ol className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {moves}
          </ol>
        </aside>
      </main>

      <footer className="mt-auto pt-12 text-slate-600 text-sm">
        Presiona cualquier movimiento para viajar en el tiempo
      </footer>
    </div>
  );
}

const calculateWinner = (squares: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};