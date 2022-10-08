import { Fragment } from "react";
import { AvatarComponent } from "./avatar-component";

export function GameInfoComponent(props: IGameInfoProps) {
  return (
    <Fragment>
      <div className="game-info-component">
        <div className="column room">{props.room}</div>
        <div className="column">Copy the above code to invite your friend and play together.</div>
        <div className="column">
          {props.users?.map(u => (
            <div className="user-avatar">
              <div className="user-avatar-pic">
                <AvatarComponent name={u.user}></AvatarComponent>
              </div>
              <div className="user-name">{u.user} ({u.userType})</div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

interface IGameInfoProps{
  users: Array<IUserInfo>;
  room: string;
};

export interface IUserInfo {
  user: string;
  userType: 'self' | 'opponent'
}