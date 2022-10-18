import { Fragment } from "react";
import { IPlayerInfo } from "../interfaces";
import { AvatarComponent } from "./avatar-component";

export function GameInfoComponent(props: IGameInfoProps) {
  return (
    <Fragment>
      <div className="game-info-component">
        <div className="board-head">Bingo Tingo</div>
        <div className="column">
          {!props.isMobile && props.users?.map(u => (
            <div className="user-avatar" key={u.user}>
              <div className="user-avatar-pic">
                <AvatarComponent name={u.user}></AvatarComponent>
              </div>
              <div className="user-name">{u.user} ({u.type})</div>
              {u.status === 'ready' && <div className="playing">&nbsp;&nbsp;playing...</div>}
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

interface IGameInfoProps{
  isMobile?: boolean;
  currentTurn: boolean;
  room: string;
  users: Array<IPlayerInfo>;
};