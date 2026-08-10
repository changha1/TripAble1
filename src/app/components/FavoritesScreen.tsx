import { Heart, Star, MapPin, ChevronRight, Search } from 'lucide-react';
import type { Place, Screen } from './types';
import { voucherStatusConfig } from './types';

interface FavoritesScreenProps {
  favorites: Place[];
  onSelectPlace: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
  navigate: (screen: Screen) => void;
}

export function FavoritesScreen({ favorites, onSelectPlace, onToggleFavorite, navigate }: FavoritesScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 py-5">
        <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.2rem' }}>관심 장소</h2>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.8rem' }}>총 {favorites.length}개 저장됨</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-rose-200" />
            </div>
            <p className="text-gray-600" style={{ fontWeight: 600, fontSize: '1rem' }}>관심 장소가 없습니다</p>
            <p className="text-gray-400 mt-2 max-w-xs" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              마음에 드는 장소의 ♥ 버튼을 눌러 관심 장소에 저장해 보세요.
            </p>
            <button
              onClick={() => navigate('trip-finder')}
              className="mt-6 bg-green-600 text-white rounded-2xl px-6 py-3 flex items-center gap-2"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              <Search className="w-4 h-4" />
              장소 탐색하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map(place => {
              const statusCfg = voucherStatusConfig[place.voucherStatus];
              return (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button onClick={() => onSelectPlace(place)} className="flex w-full text-left">
                    <div className="relative w-28 h-28 flex-none">
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full ${statusCfg.bgColor} ${statusCfg.textColor}`}
                        style={{ fontSize: '0.62rem', fontWeight: 600 }}>
                        {statusCfg.shortLabel}
                      </span>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                            {place.type}
                          </span>
                          <p className="text-gray-800 mt-1" style={{ fontWeight: 700, fontSize: '0.92rem' }}>{place.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>{place.region} {place.city}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-gray-600" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{place.rating}</span>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); onToggleFavorite(place); }}
                          className="w-8 h-8 flex items-center justify-center"
                        >
                          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-gray-50 text-gray-600 rounded-lg px-2 py-1" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                          {place.entryFee === 0 ? '무료 입장' : `${place.entryFee.toLocaleString()}원`}
                        </span>
                        {place.accessibility.wheelchair && (
                          <span className="bg-blue-50 text-blue-600 rounded-lg px-2 py-1" style={{ fontSize: '0.7rem' }}>♿</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center pr-3">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
