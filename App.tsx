import React, { useState, useEffect } from 'react';
import { Player, GameSession, ViewState, Transaction } from './types';
import { Dashboard } from './components/Dashboard';
import { NewGame } from './components/NewGame';
import { Settlements } from './components/Settlements';
import { Button, Card, Input } from './components/ui';
import { LayoutDashboard, PlusCircle, Users, History, Trash2, Calendar, Clock, Handshake, Download, MonitorDown } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  // Initialize state from localStorage or defaults
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('poker_players');
    return saved ? JSON.parse(saved) : [];
  });

  const [games, setGames] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('poker_games');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('poker_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [newPlayerName, setNewPlayerName] = useState('');

  // Persist data
  useEffect(() => {
    localStorage.setItem('poker_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('poker_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('poker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    // We've used the prompt, and can't use it again, discard it
    setInstallPrompt(null);
  };

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: newPlayerName.trim()
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    if (confirm('Bu oyuncuyu silmek istediğine emin misin? Geçmiş oyun kayıtlarında ismi görünmeye devam edebilir ama hesaplamalar bozulabilir.')) {
        setPlayers(players.filter(p => p.id !== id));
    }
  };

  const handleSaveGame = (game: GameSession) => {
    setGames([game, ...games]);
    setView('dashboard');
  };

  const deleteGame = (gameId: string) => {
    if (confirm('Bu oyun kaydını silmek istiyor musunuz?')) {
      setGames(games.filter(g => g.id !== gameId));
    }
  };

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: string) => {
    if(confirm('Bu ödeme kaydını silmek istiyor musunuz?')) {
        setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const exportGamesToExcel = () => {
    let csvContent = "Tarih;Saat;Oyuncu;Giris (Buy-In);Cikis (Kasa);Net Fark\n";

    games.forEach(game => {
      const dateObj = new Date(game.date);
      const date = dateObj.toLocaleDateString('tr-TR');
      const time = dateObj.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});

      game.results.forEach(result => {
        const player = players.find(p => p.id === result.playerId);
        const playerName = player ? player.name : 'Bilinmeyen';
        // Excel için noktalı virgül kullanıyoruz
        csvContent += `${date};${time};"${playerName}";${result.buyIn};${result.cashOut};${result.net}\n`;
      });
    });

    // Add BOM for Turkish character support in Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KumarTakip_Gecmis_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Background Image Style
  const bgStyle = {
    backgroundImage: `url('https://file-service-alpha.vercel.app/api/file/download/1741164893699-1.jpeg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Layer with Overlay */}
      <div className="fixed inset-0 z-0" style={bgStyle} />
      {/* Minimal overlay to ensure text is readable but image is very clear */}
      <div className="fixed inset-0 z-0 bg-black/10" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              KumarTakip
            </h1>
            <p className="text-gray-200 text-sm mt-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] italic font-medium">Borcunu ödemeyen bizden değildir.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {installPrompt && (
              <button 
                onClick={handleInstallApp}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg animate-bounce"
              >
                <MonitorDown size={20} />
                Uygulamayı İndir
              </button>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-xl font-mono font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-xs text-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric'})}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl mb-8 backdrop-blur-md border border-white/10 overflow-x-auto shadow-xl no-scrollbar">
          {[
            { id: 'dashboard', label: 'Durum', icon: LayoutDashboard },
            { id: 'new-game', label: 'Oyun Gir', icon: PlusCircle },
            { id: 'settlements', label: 'Ödeme/Borç', icon: Handshake },
            { id: 'history', label: 'Oyunlar', icon: History },
            { id: 'players', label: 'Oyuncular', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewState)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                view === tab.id
                  ? 'bg-white/10 text-white shadow-lg border border-white/5'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Views */}
        <div className="min-h-[400px]">
          {view === 'dashboard' && (
            <Dashboard players={players} games={games} transactions={transactions} />
          )}

          {view === 'new-game' && (
            <NewGame 
              players={players} 
              onSave={handleSaveGame} 
              onCancel={() => setView('dashboard')} 
            />
          )}

          {view === 'settlements' && (
            <Settlements 
                players={players} 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {view === 'players' && (
            <Card title="Oyuncu Yönetimi" className="animate-fade-in">
              <div className="flex gap-2 mb-6">
                <Input 
                  placeholder="Yeni oyuncu ismi..." 
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                />
                <Button onClick={addPlayer}>Ekle</Button>
              </div>

              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    <span className="font-medium">{player.name}</span>
                    <button 
                        onClick={() => removePlayer(player.id)}
                        className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Henüz oyuncu eklenmemiş.</p>
                )}
              </div>
            </Card>
          )}

          {view === 'history' && (
            <div className="space-y-4 animate-fade-in pb-20">
               <div className="flex justify-between items-center px-1">
                 <h2 className="text-xl font-bold text-white drop-shadow-md">Oyun Geçmişi</h2>
                 {games.length > 0 && (
                    <Button variant="secondary" onClick={exportGamesToExcel} className="text-sm border border-white/20 bg-black/40">
                        <Download size={16} />
                        Excel İndir
                    </Button>
                 )}
               </div>

              {games.length === 0 ? (
                <Card>
                    <p className="text-gray-500 text-center">Henüz oyun kaydı yok.</p>
                </Card>
              ) : (
                games.map(game => (
                  <Card key={game.id} className="relative group">
                    <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-green-400 font-medium">
                            <Calendar size={16} />
                            <span>{new Date(game.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock size={14} />
                            <span>{new Date(game.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteGame(game.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Kaydı Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                        {game.results.map(result => {
                             const player = players.find(p => p.id === result.playerId);
                             if (!player) return null;
                             return (
                                 <div key={result.playerId} className="text-sm border-l-2 pl-3 border-white/10">
                                     <div className="text-gray-300 font-medium truncate">{player.name}</div>
                                     <div className={`font-mono ${result.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                         {result.net > 0 ? '+' : ''}{result.net} ₺
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}