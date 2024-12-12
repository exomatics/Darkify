import styled from 'styled-components';
import { BigIconNameType, Icons } from '../Icons';

const StyledIconButton = styled.button<{ $iconScale: number }>`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  svg {
    height: 40%;
    width: 40%;
    object-fit: contain;
    transform: scale(${({ $iconScale }) => $iconScale});
  }
`;

export const IconButton = ({
  icon,
  onClick,
  className,
  iconScale,
}: {
  icon: BigIconNameType;
  onClick: () => void;
  className?: string;
  iconScale?: number;
}) => {
  const IconComponent = Icons.Big[icon];
  return (
    <StyledIconButton
      $iconScale={iconScale ?? 1}
      className={`icon-button ${className}`}
      onClick={onClick}
    >
      <IconComponent />
    </StyledIconButton>
  );
};
