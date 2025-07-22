// src/ui/HUD.tsx
import { useSessionState } from '../state/useSessionState';
import { useGameState } from '../state/useGameState';

export default function HUD() {
  const { session } = useSessionState();
  const { players, scores } = useGameState();

  if (session.status !== 'in-game') return null;

  const player1 = players?.[0] || 'Player 1';
  const player2 = players?.[1] || 'Player 2';

  const score1 = scores?.[0] ?? 0;
  const score2 = scores?.[1] ?? 0;

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-6 py-2 border-4 border-cyan-400 rounded-2xl text-white text-lg font-semibold bg-black/40 shadow-[0_0_20px_rgba(0,255,255,0.6)] backdrop-blur-sm animate-fade-in"
    >
      <span className="text-playerCyan drop-shadow-md">{player1}</span>: {score1} &nbsp;&ndash;&nbsp;
      {score2}:<span className="text-playerGreen drop-shadow-md"> {player2}</span>
    </div>
  );
}
