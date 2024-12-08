import styled from 'styled-components';

export const StyledCard = styled.div`
  max-width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .backdrop {
    width: 156px;
    margin-bottom: 2px;
  }
  .cover {
    width: 170px;
    height: 170px;
    border-radius: 10px;
  }
  .cover img {
    border-radius: 10px;
    object-fit: cover;
  }
  .content {
    background-color: rgba(149, 230, 211, 0.05);
    padding: 14px 9px 12px 9px;
    margin-top: -10px;
    border-radius: 0 0 10px 10px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .number {
    color: #95e6d3;
  }
  .description {
    color: ${({ theme }) => theme.colors.fg.secondary};
    line-height: 1;
    margin-top: 8px;
  }
`;
