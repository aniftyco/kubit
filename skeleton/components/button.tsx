import { FC } from 'react';

export type Props = {
  children?: any;
  onClick: () => void;
};

export const Button: FC<Props> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
