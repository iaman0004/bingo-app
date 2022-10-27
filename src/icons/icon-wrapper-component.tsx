export function IconWrapper(props: IiconWrapperProps): JSX.Element {
  return (
    <div className="icon-wrapper-component">
      <svg xmlns="http://www.w3.org/2000/svg" height={props.height || 24} width={props.width || 24} fill={props.color}>
        {props.children}
      </svg>
    </div>
  )
}

interface IiconWrapperProps {
  children: any;
  color?: string;
  height?: string;
  width?: string;
}
