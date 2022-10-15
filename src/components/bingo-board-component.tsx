import { useEffect, useState } from "react";

import { IN_EVENT, OUT_EVENT } from "../constants";
import { IPlayed, IPlayerInfo, IReceivedEvent } from "../interfaces";
import { shuffleBingoBoard } from "../services";

export function BingoBoardComponent(props: BingoBoardProps): JSX.Element {
  const [board, setBoard] = useState<any[][]>([[]]);
  const [chipHeight, setChipHeight] = useState<number>(0);
  
  const revealNextChip = (x: number, y: number) => {
    if (!props.currentTurn) return;
    
    const played: IPlayed = {
      room: props.room,
      played: board[x][y]
    }

    props.socket.emit(OUT_EVENT.PLAYED, played);
    setBoard(b => b.map((_x, i) => {
      _x.forEach((_y, j) => {
        if (i === x && j === y) {
          _y.active = true;
        }
        return _y;
      })
      return _x
    }));

    props.neutralizeTurnCallack();
  };

  const revealOpponentPlayedChip = (evt: IReceivedEvent) => {
    console.log(evt);
    if (evt.type !== 'success') {
      return;
    }
    setBoard(b => b.map(_x => {
      _x.forEach(_y => {
        if (_y.value === evt.data.play.value) {
          _y.active = true;
        }
        return _y;
      })
      return _x;
    }));
  }

  useEffect(()=>{
    const perColumn = (props.boardHeight - 24)/5;
    setChipHeight(perColumn);

    const _board = shuffleBingoBoard();
    setBoard(_board);
  }, [props.boardHeight]);

  useEffect(() => {
    props.socket?.on(IN_EVENT.OPPONENT_PLAYED, revealOpponentPlayedChip);
    
    return () => {
      props.socket?.off(IN_EVENT.OPPONENT_PLAYED, revealOpponentPlayedChip);
    }
  }, [props.socket, props.currentTurn]);

  return (
    <div className="bingo-board-component"
      style={{ height: props.boardHeight+2 + 'px', width: props.boardHeight+2+ 'px' }}>
      {board.map((_c , i)=> (
        <div className="board-grid-col" key={''+i}>
          {_c.map((_r, j) => (
            <div key={''+i+j}
              className={`board-grid-row ${_r.active ? 'vis' : ''}`}
              style={{ height: chipHeight+'px', width: chipHeight+'px' }} onClick={() => revealNextChip(i, j)}>
              {_r.active && <span>{_r.value }</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface BingoBoardProps {
  boardHeight: number;
  currentTurn: boolean;
  neutralizeTurnCallack: Function;
  room: string;
  socket: any;
  users: Array<IPlayerInfo>;
}