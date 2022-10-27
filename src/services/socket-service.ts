import { io } from 'socket.io-client';

export class SocketService {

  private socketInstance: object = {};

  private static _instance: SocketService;

  public static get instance(): SocketService {
    if (!this._instance) {
      this._instance = new SocketService();
    }
    return this._instance;
  }

  public initializeSocket(host: string, path: string): Promise<any> {
    if (this.socketInstance[path]) {
      return Promise.resolve(this.socketInstance[path]);
    }
    let socket = io(host, { path });

    return new Promise((resolve, reject) => {
      socket.on('connect', () => {
        this.socketInstance[path] = socket
        resolve(socket);
      })

      socket.on('connect_error', () => {
        console.info(`Connection error`);
        reject({error: 'connect_error'});
      })
    });
  }

  public destoryConnection(path: string) {
    if (this.socketInstance[path]) {
      this.socketInstance[path].close();
      delete this.socketInstance[path];
    }
  };
}