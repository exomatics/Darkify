import styled from 'styled-components';
import avatar from './mock.jpg';

const StyledAvatarIcon = styled.div`
  width: 32px;
  height: 32px;
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

export const Avatar = () => {
  return (
    <StyledAvatarIcon>
      <img src={avatar} />
    </StyledAvatarIcon>
  );
};
