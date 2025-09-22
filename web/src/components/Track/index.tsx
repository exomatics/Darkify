import { TrackInfo } from '@/api/gen';
import { BACKEND_BASE } from '@/api/api.ts';
import { formatDuration } from './lib.ts';
import { Icons } from '../UI/Icons';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/UI/context-menu.tsx';
import { Input } from '@/components/UI/input.tsx';
import { useAudioStore } from '@/features/hls-stream/store.ts';
import clsx from 'clsx';
import MusicBarsIcon from '@/components/MusicBarsIcon.tsx';

export const Track = ({
  number,
  track,
  onPlay,
  onPauseToggle,
}: {
  number: number;
  track: TrackInfo;
  onPlay?: () => void;
  onPauseToggle?: () => void;
}) => {
  const currentTrackId = useAudioStore((store) => store.currentTrack?.id);
  const isPlaying = useAudioStore((store) => store.isPlaying);
  const addToQueue = useAudioStore((store) => store.addToQueue);

  const isCurrentTrack = currentTrackId === track.id;
  const isPlayingCurrentTrack = isCurrentTrack && isPlaying;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="group flex gap-3 items-center h-[71px] rounded-md pl-4 hover:bg-bg-primary cursor-pointer">
          <div
            onClick={isCurrentTrack ? onPauseToggle : onPlay}
            className="w-[42px] h-[42px] flex justify-center items-center text-fg-secondary"
          >
            {isPlayingCurrentTrack ? (
              <>
                <div className="group-hover:hidden">
                  <MusicBarsIcon />
                </div>
                <div className="hidden group-hover:block">
                  <Icons.Big.PauseOnly className="w-3" />
                </div>
              </>
            ) : (
              <>
                <div className="block group-hover:hidden">{number}</div>
                <div className="hidden group-hover:flex justify-center items-center w-3 h-auto cursor-pointer">
                  <Icons.Big.PlayOnly />
                </div>
              </>
            )}
          </div>
          <div>
            <img
              src={
                track.cover_url?.startsWith('/') ? BACKEND_BASE + track.cover_url : track.cover_url
              }
              alt=""
              className="w-14 h-14 rounded-md object-cover"
            />
          </div>
          <div className="h-full flex flex-col justify-center gap-1 w-[400px]">
            <div className={clsx({ 'text-primary': isCurrentTrack })}>{track.name}</div>
            <div className="text-sub text-fg-secondary">
              {track.artists?.map((artist) => (
                <div className="artist">{artist.visible_username}</div>
              ))}
            </div>
          </div>
          <div className="text-fg-secondary w-[300px]">Album Name</div>
          <div className="text-fg-secondary">{formatDuration(track.duration)}</div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => addToQueue(track)}>Add to queue</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Go to artist</ContextMenuItem>
        <ContextMenuItem>Go to album</ContextMenuItem>
        <ContextMenuItem>Show credits</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Save to your Liked Songs</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Add to playlist</ContextMenuSubTrigger>
          <ContextMenuSubContent className="max-h-[350px] overflow-y-auto">
            <Input className="px-1 py-1 h-8 mb-2" placeholder="Find a playlsit" />
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
            <ContextMenuItem>Playlist name</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy song link</ContextMenuItem>
            <ContextMenuItem>Embed track</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};
