export interface IArtist {
  userId: string;
  description?: string | null;
  bannerId: string | null;
}
export type ICreateArtist = Omit<IArtist, 'bannerId'> & { file?: Express.Multer.File | null };
