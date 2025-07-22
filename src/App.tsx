// src/App.tsx
import GameCanvas from './game/GameCanvas';
import HUD from './ui/HUD';
import Menu from './ui/Menu';
import Timer from './ui/Timer';

function App() {

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      <GameCanvas />
      <HUD />
      <Menu />
      <Timer />
    </div>
  );
}

export default App;
