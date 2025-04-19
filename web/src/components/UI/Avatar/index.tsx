import styled from 'styled-components';

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

export const Avatar = ({ src, size = 15 }: { src: string; size?: number }) => {
  return (
    <StyledAvatarIcon style={{ width: size + 'px', height: size + 'px' }}>
      <img src={src} />
    </StyledAvatarIcon>
  );
};
