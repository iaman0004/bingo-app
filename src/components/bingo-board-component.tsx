import { Fragment, useCallback, useEffect, useState } from "react";
import { useSnackbar } from 'react-simple-snackbar';

import { IN_EVENT, OUT_EVENT } from "../constants";
import { IPlayed, IPlayerInfo, IReceivedEvent } from "../interfaces";
import { checkWinner, revealOpponentChip, shuffleBingoBoard, updateCurrentBoard } from "../services";

export function BingoBoardComponent(props: BingoBoardProps): JSX.Element {
  const [board, setBoard] = useState<any[][]>([[]]);
  const [chipHeight, setChipHeight] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>();
  const [openSnackbar] = useSnackbar();
  
  const revealNextChip = (x: number, y: number, isActive: boolean) => {
    if (!props.currentTurn || isActive) return;
    const chipRevealed = board[x][y];
    const updatedBoard = updateCurrentBoard(board, x, y);
    const isWinner = checkWinner(updatedBoard);

    const played: IPlayed = {
      room: props.room,
      played: chipRevealed,
      won: isWinner
    }

    props.socket.emit(OUT_EVENT.PLAYED, played);
    setBoard(b => updatedBoard);

    if (isWinner) {
      openSnackbar('Hurrah! You won! Click on <strong>New Game</string> to start another game.');
      props.neutralizePlayCallback();
      setGameOver(true);
    } 
    props.neutralizeTurnCallack();
  };

  const revealOpponentPlayedChip = useCallback((evt: IReceivedEvent) => {
    if (evt.type !== 'success') {
      return;
    }

    const updatedBoard = revealOpponentChip(board, evt.data.play.value);
    const isWinner = checkWinner(updatedBoard);
    setBoard(updatedBoard);
    if (isWinner) {
      setGameOver(true);
      props.socket.emit(OUT_EVENT.GAME_WON, {room: props.room});
      props.neutralizePlayCallback();
      props.neutralizeTurnCallack();
      openSnackbar('Hurrah! You won!');
    } else if (evt.data.won) {
      setGameOver(true);
      props.neutralizePlayCallback();
      props.neutralizeTurnCallack();
      openSnackbar('You Lost');
    }
  },[board, props, openSnackbar]);

  const opponentWon = useCallback(() => {
    const isWinner = checkWinner(board);
    if (isWinner) {
      openSnackbar('You won');
    } else {
      openSnackbar('You Lost')
    }
    setGameOver(true);

    props.neutralizePlayCallback();
  }, [board, openSnackbar, props]);


  
  const createBoard = useCallback(() => {
    const perColumn = (props.boardHeight - 24)/5;
    setChipHeight(perColumn);
    
    const _board = shuffleBingoBoard();
    setBoard(_board);
    setGameOver(false);
  }, [props.boardHeight]);
  
  const startNewGame = () => {
    props.socket.emit(OUT_EVENT.ANOTHER_GAME, {room: props.room});
    createBoard();
  }

  useEffect(()=>{
    createBoard();
  }, [createBoard, props.boardHeight]);

  useEffect(() => {
    props.socket?.on(IN_EVENT.OPPONENT_PLAYED, revealOpponentPlayedChip);
    props.socket?.on(IN_EVENT.OPPONENT_WON, opponentWon);
    props.socket?.on(IN_EVENT.ANOTHER_GAME, createBoard);

    return () => {
      props.socket?.off(IN_EVENT.OPPONENT_PLAYED, revealOpponentPlayedChip);
      props.socket?.off(IN_EVENT.OPPONENT_WON, opponentWon);
      props.socket?.off(IN_EVENT.ANOTHER_GAME, createBoard);
    }
  }, [props, board, revealOpponentPlayedChip, opponentWon, createBoard]);

  return (
    <Fragment>
      {props.leader && gameOver && <button className="button is-primary" onClick={() => startNewGame()}>Another Game</button>}
      {!gameOver && <div className={props.isMobile ? 'x-mobile' : 'x-laptop'}>{props.currentTurn ? 'Your Turn!' : 'Opponent\'s Turn'}</div>}
      <div className="bingo-board-component"
        style={{ height: props.boardHeight+2 + 'px', width: props.boardHeight+2+ 'px' }}>
        {board.map((_c , i)=> (
          <div className="board-grid-col" key={''+i}>
            {_c.map((_r, j) => (
              <div key={''+i+j}
              className={`board-grid-row ${_r.active ? 'vis' : '' } ${_r.win_shot ? 'shot' : ''}`}
              style={{ height: chipHeight+'px', width: chipHeight+'px' }} onClick={() => revealNextChip(i, j, _r.active)}>
                {_r.active && <span>{_r.value }</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Fragment>
  )
}

interface BingoBoardProps {
  isMobile?: boolean;
  boardHeight: number;
  currentTurn: boolean;
  neutralizePlayCallback: Function;
  neutralizeTurnCallack: Function;
  room: string;
  socket: any;
  users: Array<IPlayerInfo>;
  leader?: boolean;
}