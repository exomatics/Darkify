import { TrackInfo } from '../../api/gen';
import { BACKEND_BASE } from '../../api/api.ts';
import { formatDuration } from './lib.ts';
import { Icons } from '../UI/Icons';

export const Track = ({
  number,
  track,
  onPlay,
}: {
  number: number;
  track: TrackInfo;
  onPlay?: () => void;
}) => {
  return (
    <div className="group flex gap-3 items-center h-[71px] rounded-md pl-4 hover:bg-bg-primary cursor-pointer">
      <div
        onClick={onPlay}
        className="w-[42px] h-[42px] flex justify-center items-center text-fg-secondary"
      >
        <div className="block group-hover:hidden">{number}</div>
        <div className="hidden group-hover:flex justify-center items-center w-3 h-auto cursor-pointer">
          <Icons.Big.PlayOnly />
        </div>
      </div>
      <img src={BACKEND_BASE + track.cover_url} alt="" className="w-14 h-14 rounded-md" />
      <div className="h-full flex flex-col justify-center gap-1 w-[400px]">
        <div className="title">{track.name}</div>
        <div className="text-sub text-fg-secondary">
          {track.artists?.map((artist) => <div className="artist">{artist.visible_username}</div>)}
        </div>
      </div>
      <div className="text-fg-secondary w-[300px]">Album Name</div>
      <div className="text-fg-secondary">{formatDuration(track.duration)}</div>
    </div>
  );
};
