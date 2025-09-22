import { TrackInfo } from '@/api/gen';
import clsx from 'clsx';
import { TrackCover } from '@/components/UI/TrackCover.tsx';

export const CurrentTrack = ({
  currentTrack,
  className,
}: {
  currentTrack: TrackInfo | null;
  className?: string;
}) => {
  return (
    <div className={clsx(className, 'flex gap-2')}>
      <div>
        <TrackCover coverUrl={currentTrack?.cover_url} />
      </div>
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
