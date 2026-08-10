import { Home, Search, Bookmark, Heart, User } from 'lucide-react';
import type { Screen } from './types';

interface BottomNavProps {
  currentScreen: Screen;
  navigate: (screen: Screen) => void;
  favoritesCount: number;
  savedTripsCount: number;
}

const NAV_ITEMS: {
  screen: Screen;
  label: string;
  icon: React.FC<{ className?: string }>;
  activeScreens: Screen[];
}[] = [
  { screen: 'home', label: '홈', icon: Home, activeScreens: ['home'] },
  { screen: 'trip-finder', label: '여행찾기', icon: Search, activeScreens: ['trip-finder', 'results', 'place-detail', 'trip-plan'] },
  { screen: 'saved-trips', label: '저장', icon: Bookmark, activeScreens: ['saved-trips'] },
  { screen: 'favorites', label: '관심', icon: Heart, activeScreens: ['favorites'] },
  { screen: 'my-page', label: '마이', icon: User, activeScreens: ['my-page', 'guide'] },
];

export function BottomNav({ currentScreen, navigate, favoritesCount, savedTripsCount }: BottomNavProps) {
  return (
    <div className="bg-white border-t border-gray-100 flex items-stretch safe-area-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {NAV_ITEMS.map(item => {
        const isActive = item.activeScreens.includes(currentScreen);
        const Icon = item.icon;
        const badge =
          item.screen === 'favorites' && favoritesCount > 0 ? favoritesCount :
          item.screen === 'saved-trips' && savedTripsCount > 0 ? savedTripsCount :
          null;

        return (
          <button
            key={item.screen}
            onClick={() => navigate(item.screen)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative active:bg-gray-50 transition-colors"
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'} ${isActive && item.screen === 'favorites' ? 'fill-green-600' : ''}`} />
              {badge !== null && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                  style={{ fontSize: '0.6rem', fontWeight: 700 }}>
                  {badge}
                </span>
              )}
            </div>
            <span
              className={isActive ? 'text-green-600' : 'text-gray-400'}
              style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 400 }}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-green-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
