import database from '../config/database.ts';

export default {
  async getUserInfo(userId: string) {
    const fullUserInfo = await database.userModel.findByPk(userId);
    if (fullUserInfo === null) {
      return { Error: 'User with this id does not exist', Code: 404 };
    }
    const requiredUserInfo = {
      username: fullUserInfo.username,
      visible_username: fullUserInfo.visible_username,
      avatar_id: fullUserInfo.avatar_id,
      followers_id: fullUserInfo.followers_id,
      following: fullUserInfo.following_id,
    };
    return requiredUserInfo;
  },
};
