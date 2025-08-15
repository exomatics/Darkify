interface Itrack {
  id: string;
  admin_id: string;
  name: string;
  artists: string[];
  lyrics?: string | null;
  play_count: number;
  deleted?: boolean;
  duration: string;
  coverId: string;
}
interface UpdateTrack {
  id: string;
  name?: string;
  artists?: string[];
  lyrics?: string | null;
  coverId?: string;
  file?: Express.Multer.File;
}

export { Itrack, UpdateTrack };
