import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Satoshi', sans-serif;
    letter-spacing: 0.03em;
  }
  html {
    background-color: ${({ theme }) => theme.colors.bg.main};
    color: ${({ theme }) => theme.colors.fg.primary};
  }
  img {
    max-width: 100%;
    max-height: 100%;
  }

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-thumb {
  background-color: ${({ theme }) => theme.colors.bg.secondary};
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}
`;

export default GlobalStyle;
