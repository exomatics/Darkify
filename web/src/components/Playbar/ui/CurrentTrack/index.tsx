import { TrackInfo } from '../../../../api/gen';
import { BACKEND_BASE } from '../../../../api/api.ts';
import clsx from 'clsx';

export const CurrentTrack = ({
  currentTrack,
  className,
}: {
  currentTrack: TrackInfo | null;
  className?: string;
}) => {
  return (
    <div className={clsx(className, 'flex gap-2')}>
      <img className="w-14 h-14 rounded-md" src={BACKEND_BASE + currentTrack?.cover_url} />
      <div className="flex flex-col leading-none justify-between">
        <span className="text-fg-primary text-sub">{currentTrack?.name ?? ''}</span>
        <span className="text-fg-secondary text-sub">
          {currentTrack?.artists?.map((artist) => artist.visible_username)}
        </span>
        <span className="text-fg-secondary text-sub">Album Name</span>
      </div>
    </div>
  );
};
