import React, { useState } from 'react';
import { Player, Transaction } from '../types';
import { Card, Button, Input } from './ui';
import { ArrowRight, Trash2, Wallet, History } from 'lucide-react';

interface SettlementsProps {
  players: Player[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const Settlements: React.FC<SettlementsProps> = ({ players, transactions, onAddTransaction, onDeleteTransaction }) => {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (!fromId || !toId || !amount) return alert('Tüm alanları doldur cürüm.');
    if (fromId === toId) return alert('Kendine ödeme yapamazsın aslanım.');
    if (Number(amount) <= 0) return alert('Miktar pozitif olmalı.');

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      fromPlayerId: fromId,
      toPlayerId: toId,
      amount: Number(amount),
      date: new Date().toISOString()
    };

    onAddTransaction(newTransaction);
    setAmount('');
    setFromId('');
    setToId('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <Card title="Borç Öde / Hesaplaşma" className="border-yellow-500/30">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-sm text-gray-400 mb-1 block">Ödeyen (Borçtan düşer)</label>
            <select 
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Seçiniz...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-center pb-2 text-gray-500">
            <ArrowRight size={24} />
          </div>

          <div className="flex-1 w-full">
            <label className="text-sm text-gray-400 mb-1 block">Alan (Alacaktan düşer)</label>
            <select 
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seçiniz...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="w-full md:w-32">
             <Input 
                placeholder="Tutar" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
             />
          </div>

          <Button onClick={handleSave} className="w-full md:w-auto bg-yellow-600 hover:bg-yellow-500 text-white shadow-yellow-900/50">
            <Wallet size={18} />
            İşle
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-500 bg-black/20 p-2 rounded">
          * Ödeyen kişinin bakiyesine (+), alan kişinin bakiyesine (-) yansır. Böylece toplam borç kapanır.
        </p>
      </Card>

      <Card title="Hesaplaşma Geçmişi">
        <div className="space-y-3">
          {transactions.slice().reverse().map(t => {
            const fromPlayer = players.find(p => p.id === t.fromPlayerId);
            const toPlayer = players.find(p => p.id === t.toPlayerId);

            if (!fromPlayer || !toPlayer) return null;

            return (
              <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition">
                 <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-full text-yellow-500">
                        <History size={16} />
                    </div>
                    <div>
                        <div className="font-medium flex items-center gap-2 text-sm sm:text-base">
                            <span className="text-red-300">{fromPlayer.name}</span>
                            <span className="text-gray-500">→</span>
                            <span className="text-green-300">{toPlayer.name}</span>
                            <span className="text-white font-bold ml-2">{t.amount} ₺</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(t.date).toLocaleDateString('tr-TR')} {new Date(t.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                 </div>
                 <button 
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
            );
          })}
          {transactions.length === 0 && (
             <p className="text-gray-500 text-center py-4">Henüz bir ödeme kaydı girilmedi.</p>
          )}
        </div>
      </Card>
    </div>
  );
};