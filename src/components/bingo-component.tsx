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
  const boardRef = useRef(null);
  const navigate = useNavigate();

  const {players,  room } = location.state;
  if (!players || !room) {
    navigate('/join');
  }

  const assignNextTurn = useCallback(() => {
    
    setPlayer(players => {
      return player.map((p: IPlayerInfo) => {
        if ((!isYourTurn && p.type === 'self') || (isYourTurn && p.type === 'opponent')) {
          p.status = 'ready';
        } else {
          p.status = 'idle'
        }
        return p;
      })
    })

    setYourTurn(_t => !_t);
  },[player, isYourTurn]);

  /**
   * Get socket instance for subscription
   */
  
  useEffect(() => {
    SocketService.instance.initializeSocket(BASE_API_URL, '/play/').then((socket: any) => {
      setConn(socket);
    })
    console.log(boardRef.current?.['clientHeight']);
    if (boardRef.current?.['clientHeight']) {
      setBingoBoardHeight(boardRef.current?.['clientHeight']);
    }
  }, [])

  useEffect(()=>{
    conn?.on(IN_EVENT.NEXT_TURN, assignNextTurn);
    
    return () => {
      conn?.off(IN_EVENT.NEXT_TURN, assignNextTurn);
    }
  }, [conn, isYourTurn, player])

  return(
    <div className="bingo-component">
      <div className="board">
        <div className="board-bingo" ref={boardRef}>
          <BingoBoardComponent boardHeight={bingoBoardHeight} room={room} users={player} socket={conn} currentTurn={isYourTurn} neutralizeTurnCallack={assignNextTurn} />
        </div>
      </div>
      <div className="player">
        <GameInfoComponent room={room} users={player} currentTurn={isYourTurn} />
      </div>
    </div>
  );
}
