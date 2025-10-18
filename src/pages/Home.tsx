import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import SoundwaveVisualizer from '../components/SoundwaveVisualizer';

interface HomeProps {
  onStartTransfer: () => void;
  onJoinRoom: (code: string) => void;
}

export default function Home({ onStartTransfer, onJoinRoom }: HomeProps) {
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-block p-4 bg-cyan-500/10 rounded-2xl mb-4">
            <Zap className="w-16 h-16 text-cyan-400" />
          </div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
            SHIFT
          </h1>
          <p className="text-2xl text-slate-300 font-light">
            Transfer Beyond Touch — Powered by Sound & Speed
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience the future of file sharing. Connect devices through ultrasonic pairing,
            share files instantly, and watch data flow through the digital void.
          </p>
        </div>

        <div className="flex justify-center">
          <SoundwaveVisualizer size="large" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={onStartTransfer}
            className="group relative p-8 bg-gradient-to-br from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-3xl transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Start Transfer</h3>
                <p className="text-cyan-100">
                  Create a room and share files instantly
                </p>
              </div>
              <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          <div className="p-8 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-cyan-700/30 hover:border-cyan-600/50 transition-all">
            <form onSubmit={handleJoinRoom} className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-cyan-500/10 rounded-2xl">
                <ArrowRight className="w-12 h-12 text-cyan-400 rotate-180" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Join Room</h3>
                <p className="text-slate-400 mb-4">
                  Enter a room code to receive files
                </p>
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-6 py-3 bg-slate-800/70 border border-cyan-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-center font-mono text-lg"
              />
              <button
                type="submit"
                disabled={!roomCode.trim()}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors"
              >
                Connect
              </button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-8">
          <div className="text-center space-y-3 p-6 bg-slate-900/30 rounded-2xl border border-cyan-700/20">
            <div className="text-cyan-400 text-3xl font-bold">⚡</div>
            <h4 className="text-lg font-semibold text-slate-200">Lightning Fast</h4>
            <p className="text-sm text-slate-400">
              Instant file transfers with secure cloud storage
            </p>
          </div>
          <div className="text-center space-y-3 p-6 bg-slate-900/30 rounded-2xl border border-cyan-700/20">
            <div className="text-cyan-400 text-3xl font-bold">🔒</div>
            <h4 className="text-lg font-semibold text-slate-200">Secure</h4>
            <p className="text-sm text-slate-400">
              End-to-end encryption with auto-expiring links
            </p>
          </div>
          <div className="text-center space-y-3 p-6 bg-slate-900/30 rounded-2xl border border-cyan-700/20">
            <div className="text-cyan-400 text-3xl font-bold">🎯</div>
            <h4 className="text-lg font-semibold text-slate-200">Simple</h4>
            <p className="text-sm text-slate-400">
              No signup required, just share and go
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
