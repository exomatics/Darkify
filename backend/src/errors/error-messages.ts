export const errorMessages = {
  user: Object.freeze({
    NotExistsById: 'User with this id does not exist',
    NotExistsByUsernameOrEmail: 'User with this username or email does not exist',
    NotFollowsAnyone: 'User does not follow anyone',
    AlreadyFollowsUser: 'User already follows this user',
    NotFollowsUser: 'User not followes this user',
    CanNotFollowYourself: 'User can not follow themself',
    AlreadyFollowsPlaylist: 'User already follows this playlist',
    NotFollowsPlaylist: 'User not follows this playlist',
    EmailAlreadyExists: 'User with this email already exists',
    WrongPassword: 'Wrong password',
    GotNoFile: 'Got no file',
  }),
  playlist: Object.freeze({
    NotExistsById: 'Playlist with this id does not exist',
  }),
  track: Object.freeze({
    NotExistById: 'Track with this id does not exist',
  }),
  validation: Object.freeze({
    PasswordNoCapital: 'Password has no capital letters',
    PasswordNoNonCapital: 'Password has no non-capital letters',
    PasswordHasNoNumbers: 'Password must have at least one number',
    PasswordHasSpaces: 'Password must not contain spaces',
    PasswordNoSpecialSymbols: 'Password must have at least on special symbol !@#$%^&*',
    SpecifyUsernameOrEmail: 'Either email or username need to be filled in',
  }),
};
