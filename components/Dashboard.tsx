import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Player, GameSession, Transaction } from '../types';
import { Card, Button } from './ui';
import { TrendingUp, TrendingDown, DollarSign, ExternalLink, Download } from 'lucide-react';

interface DashboardProps {
  players: Player[];
  games: GameSession[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ players, games, transactions }) => {
  // Calculate aggregate stats
  const stats = players.map(player => {
    let totalNet = 0;
    let gamesPlayed = 0;
    let wins = 0;

    // 1. Calculate from Games
    games.forEach(game => {
      const result = game.results.find(r => r.playerId === player.id);
      if (result) {
        totalNet += result.net;
        gamesPlayed++;
        if (result.net > 0) wins++;
      }
    });

    // 2. Adjust with Transactions (Settlements)
    transactions.forEach(t => {
      if (t.fromPlayerId === player.id) {
        totalNet += t.amount;
      }
      if (t.toPlayerId === player.id) {
        totalNet -= t.amount;
      }
    });

    return {
      name: player.name,
      net: totalNet,
      gamesPlayed,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
    };
  }).sort((a, b) => b.net - a.net);

  const bestPlayer = stats[0];
  const worstPlayer = stats[stats.length - 1];
  const totalMoneyMoved = games.reduce((acc, game) => 
    acc + game.results.reduce((gAcc, r) => gAcc + r.buyIn, 0), 0
  );

  const rollingTexts = [
    "cigaran var mı brom", 
    "aynen aynen", 
    "cCc", 
    "Çalışak mı", 
    "Çıkmış var mı la", 
    "tabi tabi", 
    "Kafanı skm", 
    "burda sikiş var sikiş", 
    "Ders çalışmak isteyen var mı", 
    "cons kaldı mı cür", 
    "C Ü R Ü M"
  ];

  const exportStandingsToExcel = () => {
    // CSV Header
    let csvContent = "Sira;Oyuncu;Oyun Sayisi;Kazanma Orani;Net Durum (Borc/Alacak)\n";

    stats.forEach((stat, index) => {
      // CSV Row - Using semicolons for better Excel compatibility in TR regions
      csvContent += `${index + 1};"${stat.name}";${stat.gamesPlayed};%${stat.winRate};${stat.net}\n`;
    });

    // Add BOM for Turkish character support
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KumarTakip_PuanDurumu_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-900/40 to-black/60 border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-full text-green-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Lider (Kalan)</p>
              <p className="text-xl font-bold">{bestPlayer ? bestPlayer.name : '-'}</p>
              <p className="text-sm text-green-400 font-mono">
                {bestPlayer && bestPlayer.net > 0 ? '+' : ''}{bestPlayer ? bestPlayer.net : 0} ₺
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/40 to-black/60 border-red-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">En Çok Borçlu</p>
              <p className="text-xl font-bold">{worstPlayer ? worstPlayer.name : '-'}</p>
              <p className="text-sm text-red-400 font-mono">
                {worstPlayer ? worstPlayer.net : 0} ₺
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/40 to-black/60 border-blue-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Dönen Toplam Para</p>
              <p className="text-xl font-bold font-mono">{totalMoneyMoved.toLocaleString()} ₺</p>
              <p className="text-sm text-blue-400">
                {games.length} Oyun
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Genel Durum (Kalan Alacak/Verecek)">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="name" type="category" stroke="#fff" width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
              />
              <Bar dataKey="net" radius={[4, 4, 4, 4]}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Marquee Section */}
        <div className="mt-4 pt-4 border-t border-white/10 overflow-hidden relative h-8 flex items-center bg-black/30 rounded">
           <div className="marquee-content whitespace-nowrap text-emerald-400 font-mono text-sm font-bold tracking-wider">
              {rollingTexts.map((text, i) => (
                <span key={i} className="mx-8 inline-block">• {text}</span>
              ))}
              {rollingTexts.map((text, i) => (
                <span key={`dup-${i}`} className="mx-8 inline-block">• {text}</span>
              ))}
           </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detaylı Skor Tablosu</h2>
          <Button variant="ghost" onClick={exportStandingsToExcel} className="text-xs border border-white/20">
            <Download size={14} />
            Excel İndir
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm">
                <th className="py-2">Oyuncu</th>
                <th className="py-2 text-right">Oyun</th>
                <th className="py-2 text-right">Kazanma %</th>
                <th className="py-2 text-right">Net Durum</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, idx) => (
                <tr key={stat.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">{idx + 1}.</span>
                    {stat.name}
                  </td>
                  <td className="py-3 text-right text-gray-300">{stat.gamesPlayed}</td>
                  <td className="py-3 text-right text-gray-300">{stat.winRate}%</td>
                  <td className={`py-3 text-right font-mono font-bold ${stat.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.net > 0 ? '+' : ''}{stat.net} ₺
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">Henüz veri yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};