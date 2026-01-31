interface Itrack {
  id: string;
  admin_id: string;
  name: string;
  album_id?: string | null;
  artists: string[];
  lyrics?: string | null;
  play_count: number;
  deleted?: boolean;
  duration: number;
  cover_id: string | null;
}
interface UpdateTrack {
  id: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
  cover_id?: string | null;
  file: Express.Multer.File | null;
}

type TrackResult = Omit<Itrack, 'artists' | 'cover_id' | 'admin_id'> & {
  artists: { id: string; visible_username: string }[];
  cover_url: string | null;
};

export { Itrack, UpdateTrack, TrackResult };
