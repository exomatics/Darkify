import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api.ts';
import { Track } from '@/components/Track';
import { useAudioStore } from '@/features/hls-stream/store.ts';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const playTrack = useAudioStore((store) => store.playTrack);
  const togglePlayPause = useAudioStore((store) => store.togglePlayPause);

  const search = searchParams.get('search');

  const { data: tracks } = useQuery({
    queryKey: ['search', search],
    queryFn: async () => await api.track.getTracksSearch(search),
    enabled: !!search,
  });

  if (!tracks?.items) return null;
  return (
    <div>
      {tracks.items.map((trackInfo, index) => {
        return (
          <Track
            number={index + 1}
            track={trackInfo}
            onPlay={() => playTrack(trackInfo.id)}
            onPauseToggle={togglePlayPause}
          />
        );
      })}
    </div>
  );
};
