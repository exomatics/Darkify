import styled from 'styled-components';
import { BigIconNameType, Icons } from '../Icons';

const StyledIconButton = styled.button`
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
  }
`;

export const IconButton = ({
  icon,
  onClick,
  className,
}: {
  icon: BigIconNameType;
  onClick: () => void;
  className?: string;
}) => {
  const IconComponent = Icons.Big[icon];
  return (
    <StyledIconButton className={`icon-button ${className}`} onClick={onClick}>
      <IconComponent />
    </StyledIconButton>
  );
};
