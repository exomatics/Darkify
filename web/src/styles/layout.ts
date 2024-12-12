import styled from 'styled-components';

export const Layout = styled.div`
  display: grid;
  grid-template-rows: 54px 1fr 81px;
  grid-template-columns: 248px 1fr 358px;
  grid-template-areas:
    'header header header'
    'sidebar content right-sidebar'
    'sidebar playbar playbar';
  height: 100dvh;
  padding: 7px;
`;

export const MainContent = styled.div`
  grid-area: content;
  border: 1px solid ${({ theme }) => theme.colors.bg.secondary};
  margin-top: 5px;
  border-radius: 10px;
  padding: 20px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  gap: 35px;
`;
