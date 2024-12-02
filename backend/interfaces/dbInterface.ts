import { Model, ModelStatic } from "sequelize"
import { Sequelize } from "sequelize"
export interface Idb {
    sequelize: Sequelize,
    playlistModel: ModelStatic<Model>,
    playlistTrackModel: ModelStatic<Model>,
    trackModel: ModelStatic<Model>,
    userModel: ModelStatic<Model>,
    userFollowersModel : ModelStatic<Model>,
    userFollowingModel: ModelStatic<Model>,
}