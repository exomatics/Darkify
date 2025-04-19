import styled from 'styled-components';

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

export const Avatar = ({ src }: { src: string }) => {
  return (
    <StyledAvatarIcon>
      <img src={src} />
    </StyledAvatarIcon>
  );
};
