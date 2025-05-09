import { DashboardFilterButtons } from '../../components/DashboardFilterButtons';
import { CardsGrid } from '../../components/UI/CardsGrid';
import {
  CardGridElementType,
  CardGridType,
  CardsGridElement,
} from '../../components/UI/CardsGrid/types';

const mockDashboardElements: CardsGridElement[] = [
  {
    title: 'Daily Mix 1',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daily Mix 2',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daily Mix 3',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daily Mix 4',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Minecraft OST',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daft Punk',
    type: CardGridElementType.Artist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Programming music',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Dark Ambient',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daft Punk',
    type: CardGridElementType.Artist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daft Punk',
    type: CardGridElementType.Artist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Daft Punk',
    type: CardGridElementType.Artist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'The Arrow Of Time',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'A Plague Tale',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
  {
    title: 'Death Stranding OST',
    type: CardGridElementType.Playlist,
    description: 'Linkin Park, System Of A Down, Coal Chamber...',
  },
];

export const Home = () => {
  return (
    <div>
      <DashboardFilterButtons />
      <CardsGrid elements={mockDashboardElements} title="Made For You" />
      <CardsGrid type={CardGridType.Grid} elements={mockDashboardElements} title="Your Playlists" />
      <CardsGrid elements={mockDashboardElements} title="New releases for you" />
      <CardsGrid elements={mockDashboardElements} title="Discover picks for you" />
      <CardsGrid elements={mockDashboardElements} title="Your top genres" />
      <CardsGrid elements={mockDashboardElements} title="Your top artists" />
    </div>
  );
};
