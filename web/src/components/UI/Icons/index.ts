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
import Play from './assets/big/play.svg?react';
import Pause from './assets/big/pause.svg?react';
import Next from './assets/big/next.svg?react';
import Prev from './assets/big/prev.svg?react';
import Shuffle from './assets/big/shuffle.svg?react';
import Loop from './assets/big/loop.svg?react';
import Sound from './assets/big/sound.svg?react';
import AddToPlaylist from './assets/big/add-to-playlist.svg?react';
import Lyrics from './assets/big/lyrics.svg?react';
import Queue from './assets/big/queue.svg?react';
import AddFriend from './assets/big/add-friend.svg?react';
import Close from './assets/big/close.svg?react';
import Playing from './assets/big/playing.svg?react';
import ArrowRight from './assets/big/arrow-right.svg?react';
import ArrowLeft from './assets/big/arrow-left.svg?react';
import UserFilled from './assets/big/user-filled.svg?react';

export const Icons = {
  Big: {
    ArrowLeft,
    ArrowRight,
    Close,
    Queue,
    Lyrics,
    AddToPlaylist,
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
    Play,
    Pause,
    Next,
    Prev,
    Shuffle,
    Loop,
    Sound,
    AddFriend,
    Playing,
    UserFilled,
  },
};

export type BigIconNameType = keyof typeof Icons.Big;
export type IconNameType = keyof typeof Icons.Big;
