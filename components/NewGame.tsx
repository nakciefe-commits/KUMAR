import React, { useState, useEffect } from 'react';
import { Player, GameSession, PlayerGameResult } from '../types';
import { Card, Button, Input } from './ui';
import { Users, Save, RefreshCw, Plus } from 'lucide-react';

interface NewGameProps {
  players: Player[];
  onSave: (game: GameSession) => void;
  onCancel: () => void;
}

export const NewGame: React.FC<NewGameProps> = ({ players, onSave, onCancel }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameData, setGameData] = useState<Record<string, { buyIn: string; cashOut: string }>>({});
  const [error, setError] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('poker_game_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.selectedPlayers) setSelectedPlayers(parsed.selectedPlayers);
        if (parsed.gameData) setGameData(parsed.gameData);
      }
    } catch (e) {
      console.error("Draft yüklenemedi", e);
    }
  }, []);

  // Save draft to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('poker_game_draft', JSON.stringify({
      selectedPlayers,
      gameData
    }));
  }, [selectedPlayers, gameData]);

  // Initialize game data structure when selection changes (preserve existing data)
  useEffect(() => {
    const newData = { ...gameData };
    selectedPlayers.forEach(id => {
      if (!newData[id]) {
        newData[id] = { buyIn: '', cashOut: '' };
      }
    });
    setGameData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayers]);

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleInputChange = (playerId: string, field: 'buyIn' | 'cashOut', value: string) => {
    if (value && !/^\d*$/.test(value)) return;
    
    setGameData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const handleAddBuyIn = (playerId: string) => {
    const amountStr = prompt("Eklenecek Buy-In miktarı nedir?");
    if (!amountStr) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount)) return;

    setGameData(prev => {
      const currentVal = parseInt(prev[playerId]?.buyIn || '0');
      return {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          buyIn: (currentVal + amount).toString()
        }
      };
    });
  };

  const calculateTotal = () => {
    let totalBuyIn = 0;
    let totalCashOut = 0;
    
    selectedPlayers.forEach(id => {
      const data = gameData[id];
      totalBuyIn += Number(data?.buyIn || 0);
      totalCashOut += Number(data?.cashOut || 0);
    });

    return { totalBuyIn, totalCashOut, diff: totalCashOut - totalBuyIn };
  };

  const handleSave = () => {
    setError(null);
    if (selectedPlayers.length < 2) {
      setError("En az 2 oyuncu seçmelisin.");
      return;
    }

    const { diff } = calculateTotal();
    if (diff !== 0) {
      setError(`Kasa tutmuyor! Fark: ${diff > 0 ? '+' : ''}${diff} ₺. (Toplam Para Girişi: ${calculateTotal().totalBuyIn}, Çıkışı: ${calculateTotal().totalCashOut})`);
      return;
    }

    const results: PlayerGameResult[] = selectedPlayers.map(id => {
      const buyIn = Number(gameData[id].buyIn || 0);
      const cashOut = Number(gameData[id].cashOut || 0);
      return {
        playerId: id,
        buyIn,
        cashOut,
        net: cashOut - buyIn
      };
    });

    const newGame: GameSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      results
    };

    // Clear draft
    localStorage.removeItem('poker_game_draft');
    onSave(newGame);
  };

  const handleCancel = () => {
    if (confirm("Girilmiş veriler var. İptal etmek istediğine emin misin? (Taslak silinecek)")) {
      localStorage.removeItem('poker_game_draft');
      onCancel();
    }
  };

  const { diff } = calculateTotal();

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <Card title="1. Oyuncuları Seç">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                selectedPlayers.includes(player.id)
                  ? 'bg-green-600/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {player.name}
            </button>
          ))}
          {players.length === 0 && (
            <p className="col-span-full text-gray-400 italic">Önce 'Oyuncular' sekmesinden oyuncu ekleyin.</p>
          )}
        </div>
      </Card>

      {selectedPlayers.length > 0 && (
        <Card title="2. Skorları Gir">
          <div className="space-y-4">
             <div className="grid grid-cols-12 gap-4 px-2 text-xs uppercase text-gray-500 font-bold mb-2">
                <div className="col-span-4 md:col-span-3">İsim</div>
                <div className="col-span-4 md:col-span-3 text-center">Toplam Buy-In</div>
                <div className="col-span-4 md:col-span-3 text-center">Kasa (Çıkış)</div>
                <div className="hidden md:block md:col-span-3 text-right">Net</div>
             </div>
            
            {selectedPlayers.map(playerId => {
              const player = players.find(p => p.id === playerId);
              const data = gameData[playerId] || { buyIn: '', cashOut: '' };
              const net = Number(data.cashOut || 0) - Number(data.buyIn || 0);

              return (
                <div key={playerId} className="grid grid-cols-12 gap-4 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="col-span-4 md:col-span-3 font-medium truncate">{player?.name}</div>
                  <div className="col-span-4 md:col-span-3 relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={data.buyIn}
                      onChange={(e) => handleInputChange(playerId, 'buyIn', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded px-3 py-2 text-center text-red-300 focus:border-red-500 focus:outline-none pr-8"
                    />
                    <button 
                      onClick={() => handleAddBuyIn(playerId)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white bg-gray-700/50 rounded hover:bg-gray-600"
                      title="Ekle"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <input
                      type="number"
                      placeholder="0"
                      value={data.cashOut}
                      onChange={(e) => handleInputChange(playerId, 'cashOut', e.target.value)}
                      className="w-full bg-black/40 border border-gray-600 rounded px-3 py-2 text-center text-green-300 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div className={`hidden md:block md:col-span-3 text-right font-mono font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {net > 0 ? '+' : ''}{net}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <RefreshCw size={16} />
              <span>Kasa Kontrolü:</span>
            </div>
            <div className={`text-lg font-bold px-4 py-1 rounded-full ${diff === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400 animate-pulse'}`}>
               {diff === 0 ? 'Kasa Tamam' : `Fark: ${diff} ₺`}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={handleCancel} className="flex-1">İptal</Button>
            <Button onClick={handleSave} className="flex-1" disabled={diff !== 0 && selectedPlayers.length > 0}>
              <Save size={18} />
              Oyunu Kaydet
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};