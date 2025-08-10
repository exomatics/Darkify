interface Itrack {
  id: string;
  admin_id: string;
  name: string;
  artists: string[];
  lyrics?: string | null;
  play_count: number;
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
