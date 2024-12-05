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
import Home from './assets/big/home.svg?react';
import HomeFilled from './assets/big/home-filled.svg?react';
import Discover from './assets/big/discover.svg?react';
import DiscoverFilled from './assets/big/discover-filled.svg?react';
import More from './assets/big/more.svg?react';
import Add from './assets/big/add.svg?react';
import Search from './assets/big/search.svg?react';
import Notifications from './assets/big/notifications.svg?react';
import Lock from './assets/big/lock.svg?react';
import Friends from './assets/big/friends.svg?react';
import Settings from './assets/big/settings.svg?react';

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
    Home,
    HomeFilled,
    Discover,
    DiscoverFilled,
    More,
    Add,
    Search,
    Notifications,
    Lock,
    Friends,
    Settings,
  },
};

export type BigIconNameType = keyof typeof Icons.Big;
export type IconNameType = keyof typeof Icons.Big;
