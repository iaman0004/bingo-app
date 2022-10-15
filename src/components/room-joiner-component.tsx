import { useEffect, useState } from "react";
import { useNavigate   } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';

import { BASE_API_URL, DELAY, IN_EVENT, OUT_EVENT, toasts } from "../constants";
import { IPlayerInfo, IReceivedEvent, IStartGame } from "../interfaces";
import { SocketService } from "../services";
import { AvatarComponent } from "./avatar-component";

export function RoomJoinerComponent() {
  const [user, setUser] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [loader, setLoader] = useState<boolean>(false);
  const [leader, setLeader] = useState<boolean>(false);
  const [conn, setConnection] = useState<any>();
  const [players, setPlayers] = useState<Array<IPlayerInfo>>([]);
  const [openSnackbar] = useSnackbar();
  const navigate = useNavigate();

  const joinRoom = (evt: any) => {
    // setPlayers(p => [...p, {room: 'novd39k', status: 'idle', type: 'self', user: 'tony_stark'}])
    // return;
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
    setPlayers(p => [...p, {
      room: data.data.room,
      status: 'ready',
      type: 'self',
      user
    }]);
    setLeader(data.data.leader ||false);
  }

  const opponentJoined = (data: IReceivedEvent) => {
    if (data.type !== 'success') {
      openSnackbar(toasts.SOMETHING_WENT_WRONG, DELAY);
      return;
    }
    setPlayers(p => [...p, {
      room: data.data.room,
      status: 'ready',
      type: 'opponent',
      user: data.data.user
    }]);
  }

  const startGame = () => {
    if (leader) {
      const startGame: IStartGame = {
        room
      };
      conn.emit(OUT_EVENT.START_GAME, startGame);
    }
    navigate('/bingo-game', {
      state: { room, players, leader }
    });
  }

  useEffect(() => {
    if (conn) {
      conn.on(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
      conn.on(IN_EVENT.OPPONENT_JOINED, opponentJoined);
      conn.on(IN_EVENT.START_GAME, startGame);
    }
    return () => {
      if (conn) {
        conn.off(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
        conn.off(IN_EVENT.OPPONENT_JOINED, opponentJoined);
        conn.off(IN_EVENT.START_GAME, startGame);
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
            {!players?.length && 
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
            }

            {players?.length ? 
              <div className="joiner-form start-step">
                <div className="players-list">
                  {players?.map((u, i) => 
                    <div key={u.user+"_"+i} className="user-avatar">
                      <div className="user-avatar-pic">
                        <AvatarComponent name={u.user}></AvatarComponent>
                      </div>
                      <div className="user-name">{u.user} ({u.type})</div>
                    </div>
                  )}
                </div>
                <div className="actions">
                  {
                    players?.length === 2 
                    ? (leader 
                      ? <button type="button" className="button is-primary is-fullwidth" onClick={() => startGame()}>Start Game</button> 
                      : <div className="caption">Ask your friend to start the game.</div>)
                    : (<div className="invite-box">
                        <div className="room-code">{room}</div>
                        <div className="caption">Please ask your friend to join the above room.</div>
                      </div>)
                  }
                </div>
              </div>
            : null}

          </div>
        </div>
      </div>
    </div>
  );
}