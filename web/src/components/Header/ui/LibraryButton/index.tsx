import styled from 'styled-components';
import { Icons } from '../../../UI/Icons';
import { TextSub } from '../../../UI/Text';
import { IconButton } from '../../../UI/IconButton';

const StyledLibraryButton = styled.button`
  height: 54px;
  display: flex;
  padding: 15px 23px;
  align-items: center;
  cursor: pointer;
  border-radius: 10px;
  width: 248px;
  background: transparent;
  border: none;
  .label {
    color: ${({ theme }) => theme.colors.fg.secondary};
    opacity: 0.3;
    margin-left: 20px;
  }
  .library-icon {
    width: 20px;
    svg path,
    svg rect,
    svg circle {
      transition: 300ms stroke;
    }
  }
  .hover-actions {
    display: flex;
    margin-left: auto;
    opacity: 0;
    transition: 300ms opacity;
    button {
      width: 35px;
      height: 35px;
      svg {
        transform: scale(1.2);
      }
    }
  }
  &:hover {
    .library-icon {
      svg path,
      svg rect,
      svg circle {
        stroke: ${({ theme }) => theme.colors.fg.primary};
      }
    }
    .label {
      opacity: 0.5;
    }
    .hover-actions {
      opacity: 1;
    }
  }
`;

export const LibraryButton = () => {
  return (
    <StyledLibraryButton>
      <div className="library-icon">
        <Icons.Big.Library />
      </div>
      <TextSub className="label">My Library</TextSub>
      <div className="hover-actions">
        <IconButton icon="More" onClick={() => {}} />
        <IconButton icon="Add" onClick={() => {}} />
      </div>
    </StyledLibraryButton>
  );
};
