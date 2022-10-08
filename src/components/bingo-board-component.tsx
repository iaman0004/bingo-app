import { useEffect, useState } from "react";
import { BASE_API_URL, IN_EVENT, OUT_EVENT } from "../constants";
import { SocketService, shuffleBingoBoard } from "../services";

export function BingoBoardComponent(props: BingoBoardProps): JSX.Element {
  console.log(props);
  const [board, setBoard] = useState<any[][]>([[]]);
  const [chipHeight, setChipHeight] = useState<number>(0);
  const [connection, setConnection] = useState<any>();
  
  useEffect(()=>{
    const perColumn = (props.boardHeight - 24)/5;
    setChipHeight(perColumn);

    const _board = shuffleBingoBoard();
    setBoard(_board);
  }, [props.boardHeight]);

  useEffect(() => {
    SocketService.instance.initializeSocket(BASE_API_URL, '/play/').then((socket: any) => {
      setConnection(socket);

      socket.on(IN_EVENT.OPPONENT_PLAYED, revealOpponentPlayedChip);
    })
  }, []);

  const revealNextChip = (x: number, y: number) => {
    connection.emit(OUT_EVENT.PLAYED, board[x][y]);
    setBoard(b => b.map((_x, i) => {
      _x.forEach((_y, j) => {
        if (i === x && j === y) {
          _y.active = true;
        }
        return _y;
      })
      return _x
    }));
  };

  const revealOpponentPlayedChip = (evt) => {
    setBoard(b => b.map(_x => {
      _x.forEach(_y => {
        if (_y.value === evt.value) {
          _y.active = true;
        }
        return _y;
      })
      return _x;
    }));
  }

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
  user: string;
  room: string
}