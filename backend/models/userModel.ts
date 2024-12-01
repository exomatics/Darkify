// Короче пошёл нахуй сам всё вспомнишь
// import userFollowersModel from './userFollowersModel.js'
// import userFollowingModel from './userFollowingModel.js'
// import playlistModel from './playlistModel'
// import trackModel from './trackModel'
import Sequelize from 'sequelize'

module.exports = (sequelize: any) => {
	const userModel = sequelize.define(
		'user',
		{
			id: {
				type: Sequelize.UUID,
				allowNull: false,
				primaryKey: true,
			},
			is_artist: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING(25),
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING(254),
				allowNull: false,
			},
			avatar_id: {
				type: Sequelize.UUID,
				allowNull: false,
				unique: true,
			},
			followers_id: {
				type: Sequelize.UUID,
				unique: true,
			},
			following: {
				type: Sequelize.UUID,
				unique: true,
			},
			playlist: {
				type: Sequelize.UUID,
				unique: true,
			},
		},
		{
			createdAt: false,

			updatedAt: false,
		}
	)
	// userModel.hasOne(userFollowersModel, { foreignKey: 'id' })
	// userFollowersModel.belongsTo(userModel, { foreignKey: 'id' })

	// // Связь между User и UsersFollowing
	// userModel.hasOne(userFollowingModel, { foreignKey: 'id' })
	// userFollowingModel.belongsTo(userModel, { foreignKey: 'id' })

	// // Связь между User и Playlist
	// userModel.hasMany(playlistModel, { foreignKey: 'owner' })
	// playlistModel.belongsTo(userModel, { foreignKey: 'owner' })

	// // Связь между User и Track
	// userModel.hasMany(trackModel, { foreignKey: 'artist' })
	// trackModel.belongsTo(userModel, { foreignKey: 'artist' })

	return userModel
}
