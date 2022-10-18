import { useEffect, useState } from 'react';
import { BASE_API_URL, IN_EVENT, OUT_EVENT } from './constants';
import { SocketService } from './services/socket-service';

export default function App() {
  const [room, setRoom] = useState<string>('');
  const [roomSelected, setRoomSelected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [conn, setConnection] = useState<any>();
  const [convo, setConvo] = useState<any[]>([]);

  const connectToSocket = async () => {
    try {
      const socket = await SocketService.instance.initializeSocket(BASE_API_URL, '/play/');
      setConnection(socket);
    }catch(err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (conn) {
      conn.on(IN_EVENT.RECEIVE_MESSAGE, handleReceivedMessage);
      return () => {
        conn.off(IN_EVENT.RECEIVE_MESSAGE, handleReceivedMessage);
      }
    }
  }, [conn]);

  const handleSentMessage = (evt: any, connection: any) => {
    evt.preventDefault();
    if (!message.length) {
      return;
    }
    const _m = prepareConvoMessage(message);
    // connection.emit(OUT_EVENT.BROADCAST_MESSAGE, _m);
    setConvo([...convo, _m]);
    setMessage('');
  };

  const joinRoom = (evt: any) => {
    evt.preventDefault();
    conn?.emit(OUT_EVENT.JOIN_ROOM, room);
    setRoomSelected(true);
  }

  const prepareConvoMessage = (text: string) => {
    return {
      _id: Math.random().toString(),
      message: text
    }
  }

  const handleReceivedMessage = (message: object) => {
    if(!message || !Object.keys(message).length) {
      return;
    }
    setConvo(c => [...c, message]);
  }

  return (
    <div className="app">
      <button className='button is-danger' onClick={() => connectToSocket()}>Connect</button>
      <form onSubmit={e => joinRoom(e)}>
        <label>Room Name: </label>
        <input type="text" value={room} onChange={e => setRoom(e.target.value)} required disabled={roomSelected} />
      </form>
      <form onSubmit={e => handleSentMessage(e, conn)}>
        <label>Enter Message: </label>
        <input type="text" value={message} onChange={e => setMessage(e.target.value)} required />
      </form>

      <pre>{JSON.stringify(convo)}</pre>
    </div>
  );
}
