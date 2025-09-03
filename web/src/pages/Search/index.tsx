import {useSearchParams} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";
import {Track} from "../../components/Track";
import {useCallback} from "react";
import {useAudioStore} from "../../features/hls-stream/store.ts";

export const Search = () => {
  const [searchParams] = useSearchParams()
  const streamingStore = useAudioStore()

  const search = searchParams.get('search');

  const {data: tracks} = useQuery({
    queryKey: ['search', search],
    queryFn: async () => (await api.track.getTracksSearch(search)),
    enabled: !!search
  })

  const onPlay = useCallback((trackId) => {
    streamingStore.playTrack(trackId)
  }, [])

  if (!tracks) return null;
  return <div>
    {tracks.map(({trackInfo}, index) => {
      return <Track number={index + 1} track={trackInfo} onPlay={() => onPlay(trackInfo.id)} />
    })}
  </div>;
};
