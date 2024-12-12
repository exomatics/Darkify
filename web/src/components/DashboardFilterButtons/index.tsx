import styled from 'styled-components';
import { ToggleButton } from '../UI/ToggleButton';

const StyledDashboardFilterButtons = styled.div`
  display: flex;
  gap: 10px;
`;

export const DashboardFilterButtons = () => {
  return (
    <StyledDashboardFilterButtons>
      <ToggleButton active label="All" />
      <ToggleButton label="Music" />
      <ToggleButton label="Podcasts" />
      <ToggleButton label="Audiobooks" />
    </StyledDashboardFilterButtons>
  );
};
