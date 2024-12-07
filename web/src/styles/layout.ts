import styled from 'styled-components';

export const Layout = styled.div`
  display: grid;
  grid-template-rows: 54px auto;
  grid-template-columns: 248px auto;
  grid-template-areas:
    'header header'
    'sidebar content';
  height: 98dvh;
`;

export const PageLayout = styled.div`
  grid-area: content;
  border: 1px solid ${({ theme }) => theme.colors.bg.secondary};
  margin-top: 5px;
  border-radius: 10px;
`;
