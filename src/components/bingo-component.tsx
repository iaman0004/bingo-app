import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

import { BASE_API_URL, IN_EVENT } from "../constants";
import { IPlayerInfo } from "../interfaces";
import { SocketService } from "../services";
import { BingoBoardComponent } from "./bingo-board-component";
import { GameInfoComponent } from "./game-info-component";

export function BingoComponent() {
  const location = useLocation();
  const [bingoBoardHeight, setBingoBoardHeight] = useState<number>(0);
  const [player, setPlayer] = useState<Array<IPlayerInfo>>(location.state.players || []);
  const [isYourTurn, setYourTurn] = useState<boolean>(false);
  const [conn, setConn] = useState<any>(location.state.socket);
  const [isMobile, setMobile] = useState<boolean>(false);
  const boardRef = useRef(null);
  const navigate = useNavigate();

  const {players, room, leader } = location.state;
  if (!players || !room) {
    navigate('/join');
  }

  const assignNextTurn = useCallback(() => {
    setYourTurn(_t => !_t);
  },[]);

  const neutralizePlaying = useCallback(() => {
    setPlayer(player => {
      return player.map((p: IPlayerInfo) => {
        p.status = 'idle'
        return p;
      })
    })
  }, []);
  
  useEffect(() => {
    /**
     * Get socket instance for subscription
     */
    SocketService.instance.initializeSocket(BASE_API_URL, '/play/').then((socket: any) => {
      setConn(socket);
    }).catch((_err: any) => {
      navigate('/join');
    })
    if (boardRef.current?.['clientHeight']) {
      if (boardRef.current?.['clientWidth'] && boardRef.current?.['clientWidth'] < 500) {
        setBingoBoardHeight(boardRef.current?.['clientWidth'])
        setMobile(true);
      } else {
        setBingoBoardHeight(boardRef.current?.['clientHeight']);
      }
    }
  }, [])

  useEffect(()=>{
    conn?.on(IN_EVENT.NEXT_TURN, assignNextTurn);
    
    return () => {
      conn?.off(IN_EVENT.NEXT_TURN, assignNextTurn);
    }
  }, [assignNextTurn, conn, isYourTurn, player])

  return(
    <div className="bingo-component">
      <div className="board">
        <div className="board-bingo" ref={boardRef}>
          <BingoBoardComponent 
            boardHeight={bingoBoardHeight} 
            room={room} 
            users={player} 
            socket={conn} 
            currentTurn={isYourTurn} 
            neutralizeTurnCallack={assignNextTurn} 
            neutralizePlayCallback={neutralizePlaying}
            leader={leader} />
        </div>
      </div>
      <div className="player">
        <GameInfoComponent room={room} users={player} currentTurn={isYourTurn} isMobile={isMobile} />
      </div>
    </div>
  );
}
