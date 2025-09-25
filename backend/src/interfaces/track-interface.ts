interface Itrack {
  id: string;
  admin_id: string;
  name: string;
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

export { Itrack, UpdateTrack };
