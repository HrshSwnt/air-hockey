import { useGameTimer } from '../state/useGameTimer';

export default function Timer() {
  const remaining = useGameTimer();

  if (remaining == null) return null;

  const seconds = Math.ceil(remaining / 1000);
  const display = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-4 right-6 z-10 text-white text-xl font-mono bg-black/40 px-4 py-1 rounded-lg border border-cyan-300 shadow">
      ⏱️ {display}
    </div>
  );
}
