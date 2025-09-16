import { ToggleButton } from '../UI/ToggleButton';

export const DashboardFilterButtons = () => {
  return (
    <div className="flex gap-3">
      <ToggleButton active label="All" />
      <ToggleButton label="Music" />
      <ToggleButton label="Podcasts" />
      <ToggleButton label="Audiobooks" />
    </div>
  );
};
