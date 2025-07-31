interface Itrack {
  id: string;
  name: string;
  artists: string[];
  lyrics?: string | null;
  play_count: string;
  track_foldername: string;
  deleted?: boolean;
  duration: string;
}
interface UpdateTrack {
  id: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
}

export { Itrack, UpdateTrack };
