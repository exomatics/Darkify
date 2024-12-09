import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      fg: {
        primary: string;
        secondary: string;
        tertiary: string;
        light: {
          primary: string;
          secondary: string;
        };
      };
      bg: {
        primary: string;
        secondary: string;
        main: string;
        light: {
          main: string;
        };
      };
      light: {
        primary: string;
      };
    };
  }
}
