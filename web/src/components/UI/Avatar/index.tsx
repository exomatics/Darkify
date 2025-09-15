import styled from 'styled-components';
import { Icons } from '../Icons';
import { BACKEND_BASE } from '../../../api/api.ts';

const StyledAvatarIcon = styled.div`
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Avatar = ({ src, size = 15 }: { src?: string; size?: number }) => {
  return (
    <StyledAvatarIcon style={{ width: size + 'px', height: size + 'px' }}>
      {src ? (
        <img src={BACKEND_BASE + src} />
      ) : (
        <StyledEmptyAvatar>
          <Icons.Big.UserFilled />
        </StyledEmptyAvatar>
      )}
    </StyledAvatarIcon>
  );
};

const StyledEmptyAvatar = styled.div`
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 50%;
    height: 50%;
  }
`;
