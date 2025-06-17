/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserInfo } from '../models/UserInfo';
import type { UserPreview } from '../models/UserPreview';
import type { UserSettings } from '../models/UserSettings';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UserService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get current user info
   * @returns UserInfo User info
   * @throws ApiError
   */
  public getUsersMe(): CancelablePromise<UserInfo> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/users/me',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Update current user info
   * @param requestBody
   * @returns UserPreview User info
   * @throws ApiError
   */
  public putUsersMe(requestBody: { visible_username?: string }): CancelablePromise<UserPreview> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/users/me',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Delete current user
   * @returns any Successful response with no data
   * @throws ApiError
   */
  public deleteUsersMe(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/users/me',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Get current user settings
   * @returns UserSettings List of user settings
   * @throws ApiError
   */
  public getUsersMeSettings(): CancelablePromise<UserSettings> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/users/me/settings',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Update current user settings
   * @param requestBody
   * @returns UserSettings List of user settings
   * @throws ApiError
   */
  public putUsersMeSettings(requestBody: UserSettings): CancelablePromise<UserSettings> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/users/me/settings',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Get users followed by current user
   * @returns any List of following users
   * @throws ApiError
   */
  public getUsersMeFollowing(): CancelablePromise<{
    total?: number;
    offset?: number;
    next?: number | null;
    items?: Array<UserPreview>;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/users/me/following',
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Get user info by ID
   * @param userId
   * @returns UserInfo User info
   * @throws ApiError
   */
  public getUsers(userId: string): CancelablePromise<UserInfo> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/users/{userId}',
      path: {
        user_id: userId,
      },
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Follow specified user
   * @param userId
   * @returns any Successful response with no data
   * @throws ApiError
   */
  public postUsersFollowUser(userId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/users/follow/user/{userId}',
      path: {
        user_id: userId,
      },
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Unfollow specified user
   * @param userId
   * @returns any Successful response with no data
   * @throws ApiError
   */
  public postUsersUnfollowUser(userId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/users/unfollow/user/{userId}',
      path: {
        user_id: userId,
      },
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Follow specified playlist
   * @param playlistId
   * @returns any Successful response with no data
   * @throws ApiError
   */
  public postUsersFollowPlaylist(playlistId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/users/follow/playlist/{playlistId}',
      path: {
        playlist_id: playlistId,
      },
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Unfollow specified playlist
   * @param playlistId
   * @returns any Successful response with no data
   * @throws ApiError
   */
  public postUsersUnfollowPlaylist(playlistId: string): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/users/unfollow/playlist/{playlistId}',
      path: {
        playlist_id: playlistId,
      },
      errors: {
        400: `Validation failed`,
        401: `Unauthorized or invalid token`,
      },
    });
  }
  /**
   * Get avatar url
   * @returns any avatar url
   * @throws ApiError
   */
  public getUsersMeAvatar(): CancelablePromise<{
    avatar_url?: string;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/users/me/avatar',
    });
  }
  /**
   * Change avatar for current user
   * @param formData
   * @throws ApiError
   */
  public putUsersMeAvatar(formData?: any): CancelablePromise<void> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/users/me/avatar',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
}
