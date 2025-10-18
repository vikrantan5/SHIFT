import { useState } from 'react';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import RoomView from './pages/RoomView';
import { Room } from './types';

type View = 'home' | 'create' | 'room';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentRoomCode, setCurrentRoomCode] = useState<string>('');

  const handleStartTransfer = () => {
    setCurrentView('create');
  };

  const handleJoinRoom = (code: string) => {
    setCurrentRoomCode(code);
    setCurrentView('room');
  };

  const handleRoomCreated = (room: Room) => {
    setCurrentRoomCode(room.room_code);
  };

  const handleBackHome = () => {
    setCurrentView('home');
    setCurrentRoomCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10">
        {currentView !== 'home' && (
          <div className="fixed top-6 left-6 z-50">
            <button
              onClick={handleBackHome}
              className="px-4 py-2 bg-slate-800/50 backdrop-blur-xl border border-cyan-700/30 hover:border-cyan-600/50 rounded-xl text-cyan-400 font-semibold transition-all"
            >
              ← Back to Home
            </button>
          </div>
        )}

        {currentView === 'home' && (
          <Home onStartTransfer={handleStartTransfer} onJoinRoom={handleJoinRoom} />
        )}

        {currentView === 'create' && (
          <CreateRoom onRoomCreated={handleRoomCreated} />
        )}

        {currentView === 'room' && currentRoomCode && (
          <RoomView roomCode={currentRoomCode} />
        )}
      </div>

      <div className="fixed bottom-4 right-4 text-xs text-slate-600">
        SHIFT v1.0
      </div>
    </div>
  );
}

export default App;
