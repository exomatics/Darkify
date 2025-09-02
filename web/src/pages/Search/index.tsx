import {useSearchParams} from "react-router";
import {useQuery} from "@tanstack/react-query";
import {api} from "../../api/api.ts";
import {Track} from "../../components/Track";

export const Search = () => {
  const [searchParams] = useSearchParams()

  const search = searchParams.get('search');

  const {data: tracks} = useQuery({
    queryKey: ['search', search],
    queryFn: async () => (await api.track.getTracksSearch(search)),
    enabled: !!search
  })
  console.log(tracks)
  if (!tracks) return null;
  return <div>
    {tracks.map(({trackInfo}, index) => {
      console.log('info', trackInfo)
      return <Track number={index + 1} track={trackInfo} />
    })}
  </div>;
};
