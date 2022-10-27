import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'react-simple-snackbar';

import { BASE_API_URL, DELAY, IN_EVENT, OUT_EVENT, toasts } from "../constants";
import { IPlayerInfo, IReceivedEvent, IStartGame } from "../interfaces";
import { fetchPathQuery, SocketService } from "../services";
import { AvatarComponent } from "./avatar-component";
import { IconWrapper, IconArrowBackFilled24px, IconShareFilled24px, IconPlayFilled24px, IconArrowFilled24px } from '../icons';

export function RoomJoinerComponent() {
  const [user, setUser] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [loader, setLoader] = useState<boolean>(false);
  const [leader, setLeader] = useState<boolean>(false);
  const [conn, setConnection] = useState<any>();
  const [players, setPlayers] = useState<Array<IPlayerInfo>>([]);
  const [openSnackbar] = useSnackbar();
  const navigate = useNavigate();
  const play = useParams();

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
    setPlayers(p => [...p, {
      room: data.data.room,
      status: 'idle',
      type: 'self',
      user
    }]);
    setLeader(data.data.leader ||false);
  };

  const opponentJoined = (data: IReceivedEvent) => {
    if (data.type !== 'success') {
      openSnackbar(toasts.SOMETHING_WENT_WRONG, DELAY);
      return;
    }
    setPlayers(p => [...p, {
      room: data.data.room,
      status: 'idle',
      type: 'opponent',
      user: data.data.user
    }]);
  };

  const startGame = () => {
    if (leader) {
      const gameRoom: IStartGame = {
        room
      };
      conn.emit(OUT_EVENT.START_GAME, gameRoom);
    }
    navigate('/bingo-game', {
      state: { room, players, leader }
    })
  };

  const sendInvite = (roomId: string) => {
    const url = `${window.location.href}?play=${roomId}`;
    
    const sharableData: ShareData = {
      title: 'Bingo Tingo',
      text: 'Play lengendary Bingo with your friends.',
      url
    }
    if (navigator && navigator.canShare(sharableData)) {
      navigator.share(sharableData);
    } else {
      openSnackbar('Invite failed. Please ask your friend to join the room.');
    }
  }

  const leaveRoom = () => {
    setConnection(undefined);
    SocketService.instance.destoryConnection('/play/');
    setPlayers([]);
    setRoom('');
  };

  useEffect(() => {
    const query = fetchPathQuery(window.location.href);
    console.log(query);
    if (query && query['play']) {
      setRoom(query['play']);
    }
  },[]);

  useEffect(() => {
    conn?.on(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
    conn?.on(IN_EVENT.OPPONENT_JOINED, opponentJoined);
    conn?.on(IN_EVENT.START_GAME, startGame);
    return () => {
      console.log('Destroyer called');
      conn?.off(IN_EVENT.RECEIVE_ROOM_ID, joinedRoomEvent);
      conn?.off(IN_EVENT.OPPONENT_JOINED, opponentJoined);
      conn?.off(IN_EVENT.START_GAME, startGame);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn, players, play])

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
                  <button type="submit" className={`button is-primary is-fullwidth ${loader ? 'is-loading' : ''}`}>
                    <div className="invite-text">Join</div>
                    <IconWrapper color="#FEFFFE">
                      <IconArrowFilled24px />
                    </IconWrapper>
                  </button>
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
                      ? <button type="button" className="button is-primary is-fullwidth" onClick={() => startGame()}>
                          <IconWrapper color="#FEFFFE">
                            <IconPlayFilled24px />
                          </IconWrapper>
                          <span className="invite-text">Start Game</span>
                        </button> 
                      : <div className="caption">Ask your friend to start the game.</div>)
                    : (<div className="invite-box">
                        <div className="caption">Send invite to your friend to play together.</div>
                        <div className="field has-addons">
                          <p className="control">
                            <button className="button" onClick={() => leaveRoom()}>
                              <IconWrapper color="#373E40" height="24" width="24">
                                <IconArrowBackFilled24px />
                              </IconWrapper>
                            </button>
                          </p>
                          <p className="control w-100p">
                            <button className="button is-primary w-100p" onClick={() => sendInvite(room)}>
                              <span className="invite-text">Invite</span>
                              <IconWrapper color="#FEFFFE">
                                <IconShareFilled24px />
                              </IconWrapper>
                            </button>
                          </p>
                        </div>
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