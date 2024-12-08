import styled from 'styled-components';

export const Layout = styled.div`
  display: grid;
  grid-template-rows: 54px auto 81px;
  grid-template-columns: 248px auto 358px;
  grid-template-areas:
    'header header header'
    'sidebar content right-sidebar'
    'sidebar playbar playbar';
  height: 98dvh;
`;

export const MainContent = styled.div`
  grid-area: content;
  border: 1px solid ${({ theme }) => theme.colors.bg.secondary};
  margin-top: 5px;
  border-radius: 10px;
  padding: 20px;
`;
