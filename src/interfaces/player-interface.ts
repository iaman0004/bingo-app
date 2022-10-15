export interface IPlayerInfo {
  user: string;
  room: string;
  type: 'self' | 'opponent';
  status: 'ready' | 'idle';
}

export interface IStartGame {
  room: string;
}