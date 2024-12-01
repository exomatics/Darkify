import { IUser } from './userInterface'
export interface Itrack {
	id: string
	name: string
	artist: IUser['id'][]
	lyrics: string
	numberOfPlay: number
}
