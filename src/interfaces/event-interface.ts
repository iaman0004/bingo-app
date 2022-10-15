export interface IReceivedEvent {
  type: 'failed' | 'success';
  data: any;
}

export interface IPlayed {
  room: string;
  played: number | string;
}