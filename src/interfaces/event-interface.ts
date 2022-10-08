export interface IReceivedEvent {
  type: 'failed' | 'success';
  data: any;
}