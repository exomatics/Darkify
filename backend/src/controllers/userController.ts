import db from '../config/db.ts';

export default {
  async getUserInfo(userId: string) {
    const fullUserInfo = await db.userModel.findByPk(userId);
    if (fullUserInfo === null) {
      return { Error: 'User with this id does not exist', Code: 404 };
    }
    const requiredUserInfo = {
      name: fullUserInfo.dataValues.name,
      avatar_id: fullUserInfo.dataValues.avatar_id,
      followers_id: fullUserInfo.dataValues.followers_id,
      following: fullUserInfo.dataValues.following,
    };
    return requiredUserInfo;
  },
};
