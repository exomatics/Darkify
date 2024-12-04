import Library from './assets/big/library.svg?react';
import Pin from './assets/big/pin.svg?react';
import Playlist from './assets/big/playlist.svg?react';
import Like from './assets/big/like.svg?react';
import Save from './assets/big/save.svg?react';
import Album from './assets/big/album.svg?react';
import Folder from './assets/big/folder.svg?react';
import Podcast from './assets/big/podcast.svg?react';
import AudioBook from './assets/big/audiobook.svg?react';
import Artist from './assets/big/artist.svg?react';
import Expand from './assets/big/expand.svg?react';

export const Icons = {
  Big: {
    Library,
    Pin,
    Playlist,
    Like,
    Save,
    Album,
    Folder,
    Podcast,
    AudioBook,
    Artist,
    Expand,
  },
};

export type BigIconNameType = keyof typeof Icons.Big;
export type IconNameType = keyof typeof Icons.Big;
