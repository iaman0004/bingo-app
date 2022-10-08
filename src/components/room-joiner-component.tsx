import { useEffect, useState } from "react";
import { useNavigate   } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';

import { BASE_API_URL, DELAY, IN_EVENT, OUT_EVENT, toasts } from "../constants";
import { IReceivedEvent } from "../interfaces";
import { SocketService } from "../services";

export function RoomJoinerComponent() {
  const [user, setUser] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [loader, setLoader] = useState<boolean>(false);
  const [conn, setConnection] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openSnackbar, closeSnackbar] = useSnackbar();
  const navigate = useNavigate();

  const joinRoom = (evt: any) => {
    evt.preventDefault();

    if (!user.length) {
      openSnackbar('Please enter Player Name !', 2500);
      return;
    }
    connectToSocket();
  };  

  const handleUserInput = (evt: any, type: 'user' | 'room') => {
    if (type === 'user') {
      const userRx = /^[a-zA-Z0-9_]{0,64}$/;
      const lastState = user;
      const val: string = evt.target.value;
      
      if (!userRx.test(val)) {
        setUser(lastState);
        return;
      }
      setUser(val);
    }
    else if (type === 'room') {
      const roomRx = /^[a-zA-Z0-9]{0,8}$/;
      const lastState = room;
      const val: string = evt.target.value;
      
      if (!roomRx.test(val)) {
        setRoom(lastState);
        return;
      }
      setRoom(val.toUpperCase());
    }
  }

  const connectToSocket = async () => {
    setLoader(true);
    try {
      const socket = await SocketService.instance.initializeSocket(BASE_API_URL, '/play/');
      const joinEvent = {
        user,
        room
      }
      socket.emit(OUT_EVENT.JOIN_ROOM, joinEvent);
      setConnection(socket);
    }catch(err) {
      openSnackbar('Something went wrong. Please try again.');
    }
  }

  const joinedRoomEvent = (data: IReceivedEvent) => {
    if (data.type !== 'success') {
      openSnackbar(toasts.SOMETHING_WENT_WRONG, DELAY);
      return;
    }
    setRoom(data.data.room);
    setLoader(false);
    navigate('/bingo-game', {
      state: { user, room: data.data.room }
    });
  }

  useEffect(() => {
    if (conn) {
      conn.on(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
    }
    return () => {
      if (conn) {
        conn.off(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn])

  return(
    <div className="room-joiner-component">
      <div className="room-entry">
        <div className="columns">
          <div className="column">
            <div className="title">Bingo Tingo</div>
          </div>
          <div className="saperator"></div>
          <div className="column">
            <form className="joiner-form" onSubmit={e => joinRoom(e)}>
              <div className="column">
                <label className="label">Player Name</label>
                <input className="input is-primary" type="text" placeholder="steve_Roger" value={user} onChange={e => handleUserInput(e, 'user')} autoComplete="off"/>
              </div>
              <div className="column">
                <label className="label">Room Name (Optional)</label>
                <input className="input is-primary" type="text" placeholder="F92N3PYN" value={room} onChange={e => handleUserInput(e, 'room')} autoComplete="off" />
              </div>
              <div className="column">
                <button type="submit" className={`button is-primary is-fullwidth ${loader ? 'is-loading' : ''}`}>Join</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}