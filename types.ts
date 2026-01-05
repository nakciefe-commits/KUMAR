export interface Player {
  id: string;
  name: string;
}

export interface PlayerGameResult {
  playerId: string;
  buyIn: number;
  cashOut: number;
  net: number;
}

export interface GameSession {
  id: string;
  date: string; // ISO string
  results: PlayerGameResult[];
}

export interface Transaction {
  id: string;
  fromPlayerId: string; // Parayı ödeyen (Borcunu kapatan)
  toPlayerId: string;   // Parayı alan (Alacağını tahsil eden)
  amount: number;
  date: string;
}

export type ViewState = 'dashboard' | 'new-game' | 'players' | 'history' | 'settlements';