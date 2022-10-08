export function AvatarComponent(props: IAvatarProps) {
  const avatar = props.name?.slice(0,2);
  const color = ['#FF8787', '#FF731D', '#5F9DF7', '#38E54D', '#FF577F'];
  const colorIdx = avatar.charCodeAt(0) % color.length;

  return (
    <div className="avatar-component">
      <div className="avatar" style={{ color: color[colorIdx] }}> { avatar }</div>
    </div>
  );
}

interface IAvatarProps {
  name: string;
}