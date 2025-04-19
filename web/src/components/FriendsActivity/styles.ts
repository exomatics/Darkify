import styled from 'styled-components';

export const StyledFriendsActivity = styled.div`
  grid-area: right-sidebar;
  border: 1px solid ${({ theme }) => theme.colors.bg.secondary};
  border-radius: 10px;
  margin-top: 4px;
  margin-left: 5px;
  padding: 20px;
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .title {
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.03em;
    }
    .actions {
      display: flex;
      gap: 15px;
    }
  }
  .active-friends {
    margin-top: 44px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;
