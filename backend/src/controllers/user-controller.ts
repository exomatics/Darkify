import database from '../config/database.ts';
import NotFoundError from '../errors/not-found-error.ts';

export default {
  async getUserInfo(userId: string) {
    //перенести в валидацию
    const fullUserInfo = await database.userModel.findByPk(userId);
    if (fullUserInfo === null) {
      throw new NotFoundError('User with this id does not exist');
    }
    ////
    const requiredUserInfo = {
      username: fullUserInfo.username,
      visible_username: fullUserInfo.visible_username,
      avatar_id: fullUserInfo.avatar_id,
      followers_id: fullUserInfo.followers_id,
      following: fullUserInfo.following_id,
    };
    return requiredUserInfo;
  },
  async getUserPlaylists(userId: string) {
    const fullUserInfo = await database.userModel.findByPk(userId);
    if (fullUserInfo === null) {
      return new NotFoundError('User with this id does not exist');
    }
    const requiredUserInfo = {
      playlists: fullUserInfo.playlist,
    };
    return requiredUserInfo;
  },
  /// asyncHandler on authorization
  async updateUserInfo(userInfo: {
    userId: string;
    isArtist: boolean;
    followersId: string;
    followingId: string;
    playlists: string;
    visibleUsername: string;
  }) {
    const fullUserInfo = await database.userModel.findByPk(userInfo.userId);
    if (fullUserInfo === null) {
      return new NotFoundError('User with this id does not exist');
    }
    await fullUserInfo.update({
      is_artist: userInfo.isArtist,
      followers_id: userInfo.followersId,
      following_id: userInfo.followingId,
      playlist: userInfo.playlists,
      visible_username: userInfo.visibleUsername,
    });
  },
  async deleteUser(userId: string) {
    const user = await database.userModel.findByPk(userId);
    if (user === null) {
      return new NotFoundError('User with this id does not exist');
    }
    await user.destroy();
  },
};
//implement updateUserAvatar, updateUserEmail
