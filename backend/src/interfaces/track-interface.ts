interface Itrack {
  id: string;
  name: string;
  artists: string[];
  lyrics?: string | null;
  play_count: number;
  track_id: string;
  deleted?: boolean;
}
interface UpdateTrack {
  id: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
}

export { Itrack, UpdateTrack };
