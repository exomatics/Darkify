import { Icons } from '../UI/Icons';
import { StyledSidebar } from './styles';
import { SidebarElement } from './ui/SidebarElement';

export type SidebarElementDataBase = {
  label: string;
  icon: keyof typeof Icons.Big;
};

type SidebarElementDataWithChildren = SidebarElementDataBase & {
  expandable: true;
  children: SidebarElementDataBase[];
};

type SidebarElementDataWithoutChildren = SidebarElementDataBase & {
  expandable?: false;
  children?: never;
};

type SidebarElementData = SidebarElementDataWithChildren | SidebarElementDataWithoutChildren;

const sidebarElements: SidebarElementData[] = [
  {
    label: 'Pins',
    icon: 'Pin',
    expandable: true,
    children: [
      {
        icon: 'Playlist',
        label: 'Your Top Songs 2024',
      },
      {
        icon: 'Playlist',
        label: 'Daily Mix 1',
      },
      {
        icon: 'Album',
        label: 'Minecraft - Volume Alpha',
      },
      {
        icon: 'Playlist',
        label: 'Programming Music',
      },
    ],
  },
  {
    label: 'Playlists',
    icon: 'Playlist',
    expandable: true,
    children: [
      {
        icon: 'Playlist',
        label: 'Chill stuff',
      },
      {
        icon: 'Playlist',
        label: 'Rock n Roll',
      },
      {
        icon: 'Playlist',
        label: 'The Jux Box',
      },
      {
        icon: 'Playlist',
        label: 'Selected Linkin Park',
      },
      {
        icon: 'Playlist',
        label: 'Vibe',
      },
    ],
  },
  {
    label: 'Liked Songs',
    icon: 'Like',
  },
  {
    label: 'Saves',
    icon: 'Save',
  },
  {
    label: 'Albums',
    icon: 'Album',
  },
  {
    label: 'Folders',
    icon: 'Folder',
  },
  {
    label: 'Podcasts',
    icon: 'Podcast',
  },
  {
    label: 'Audiobooks',
    icon: 'AudioBook',
  },
  {
    label: 'Artists',
    icon: 'Artist',
  },
];

export const Sidebar = () => {
  return (
    <StyledSidebar>
      {sidebarElements.map((element) => (
        <SidebarElement
          key={element.label}
          icon={element.icon}
          expandable={element.expandable}
          expandedElements={element.children}
        >
          {element.label}
        </SidebarElement>
      ))}
    </StyledSidebar>
  );
};
