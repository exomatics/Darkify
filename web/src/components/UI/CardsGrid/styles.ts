import styled from 'styled-components';

export const StyledCardsGrid = styled.div`
  display: grid;
  .swiper {
    width: 100%;
  }
  .swiper-slide {
    width: auto;
  }
  .header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    .right {
      display: flex;
      gap: 15px;
    }
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 11px;
  }
`;
