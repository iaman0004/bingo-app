import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { BingoBoardComponent } from "./bingo-board-component";
import { GameInfoComponent, IUserInfo } from "./game-info-component";


export function BingoComponent() {
  const [bingoBoardHeight, setBingoBoardHeight] = useState<number>(0);
  const [turn, setTurn] = useState<IUserInfo>({
    user: 'Clint',
    userType: 'self'
  })
  const boardRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { players, room } = location.state;
  if (!players || !room) {
    navigate('/join');
  }

  useEffect(()=>{
    console.log(boardRef.current?.['clientHeight']);
    if (boardRef.current?.['clientHeight']) {
      setBingoBoardHeight(boardRef.current?.['clientHeight'] - 50);
    }
  }, [])

  return(
    <div className="bingo-component">
      <div className="board">
        <div className="board-head">Bingo Tingo</div>
        <div className="board-bingo" ref={boardRef}>
          <BingoBoardComponent boardHeight={bingoBoardHeight} room={room} user={players} />
        </div>
        <div className="board-turn">
          {turn?.userType === 'self' ? <span>Your turn</span> : <span>{turn?.user}'s turn</span>}
        </div>
      </div>
      <div className="player">
        <GameInfoComponent room={room} users={players} />
      </div>
    </div>
  );
}