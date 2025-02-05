import database from '../config/database.ts';
import NotFoundError from '../errors/not-found-error.ts';

export default {
  async getUserInfo(userId: string) {
    //перенести в валидацию
    const fullUserInfo = await database.userModel.findByPk(userId);
    if (fullUserInfo === null) {
      return new NotFoundError('User with this id does not exist');
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
};
