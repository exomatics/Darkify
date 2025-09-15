import LogoIcon from './assets/logo.svg?react';
import styled from 'styled-components';

export const SplashScreen = () => {
  return (
    <StyledSplashScreen>
      <div className="logo">
        <LogoIcon width={55} height={55} />
        <span>Darkify</span>
      </div>
    </StyledSplashScreen>
  );
};

const StyledSplashScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;

  .logo {
    display: flex;
    align-items: center;

    svg path {
      stroke: ${({ theme }) => theme.colors.primary};
    }

    span {
      color: ${({ theme }) => theme.colors.primary};
      font-weight: bold;
      font-size: 30px;
    }
  }
`;
