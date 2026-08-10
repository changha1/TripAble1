import { Search, MapPin, Bookmark, ChevronRight, Star, CreditCard, Info, Clock } from 'lucide-react';
import type { Screen, Place } from './types';
import { MOCK_PLACES, VOUCHERS } from './mockData';
import { voucherStatusConfig } from './types';

interface HomeScreenProps {
  onFindTrip: () => void;
  onSelectPlace: (place: Place) => void;
  navigate: (screen: Screen) => void;
  isLoggedIn: boolean;
  favorites: Place[];
}

function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
  const status = voucherStatusConfig[place.voucherStatus];
  return (
    <div
      className="flex-none w-44 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform"
      onClick={onClick}
    >
      <div className="relative h-28">
        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
        <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium ${status.bgColor} ${status.textColor}`}>
          {status.shortLabel}
        </span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-800 truncate" style={{ fontSize: '0.82rem' }}>{place.name}</p>
        <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.72rem' }}>{place.region} · {place.type}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-gray-700" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{place.rating}</span>
          <span className="text-gray-400" style={{ fontSize: '0.7rem' }}>({place.reviewCount.toLocaleString()})</span>
        </div>
        {place.entryFee > 0 ? (
          <p className="text-green-600 mt-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
            입장료 {place.entryFee.toLocaleString()}원
          </p>
        ) : (
          <p className="text-green-600 mt-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>무료 입장</p>
        )}
      </div>
    </div>
  );
}

export function HomeScreen({ onFindTrip, onSelectPlace, navigate, isLoggedIn, favorites }: HomeScreenProps) {
  const featuredPlaces = MOCK_PLACES.filter(p => p.voucherStatus === 'available').slice(0, 4);
  const recentPlaces = MOCK_PLACES.slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-200" style={{ fontSize: '0.8rem' }}>
              {isLoggedIn ? '안녕하세요! 👋' : '환영합니다'}
            </p>
            <h2 className="text-white" style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              {isLoggedIn ? '오늘도 좋은 여행 되세요' : '내 바우처로 여행 찾기'}
            </h2>
          </div>
          <button
            onClick={() => navigate('my-page')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <span style={{ fontSize: '1.2rem' }}>👤</span>
          </button>
        </div>

        {/* Main CTA */}
        <button
          onClick={onFindTrip}
          className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 shadow-lg active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-green-700" />
          </div>
          <div className="text-left flex-1">
            <p className="text-green-700" style={{ fontWeight: 700, fontSize: '0.9rem' }}>맞춤 여행 찾기</p>
            <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>바우처·지역·편의조건으로 검색</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="px-5 -mt-4 space-y-5">
        {/* Quick access cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '♿', label: '휠체어\n접근 가능', bg: 'bg-blue-50', text: 'text-blue-700', action: onFindTrip },
            { emoji: '👨‍👩‍👧', label: '가족과\n함께', bg: 'bg-purple-50', text: 'text-purple-700', action: onFindTrip },
            { emoji: '🗓️', label: '당일\n여행', bg: 'bg-amber-50', text: 'text-amber-700', action: onFindTrip },
          ].map(({ emoji, label, bg, text, action }) => (
            <button
              key={label}
              onClick={action}
              className={`${bg} rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-95 transition-transform`}
            >
              <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
              <p className={`${text} text-center`} style={{ fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{label}</p>
            </button>
          ))}
        </div>

        {/* Voucher info banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-green-600 flex-none mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800" style={{ fontWeight: 600, fontSize: '0.85rem' }}>지원 바우처 안내</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {VOUCHERS.map(v => (
                  <span
                    key={v.id}
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ fontSize: '0.7rem', backgroundColor: v.color }}
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => navigate('guide')} className="flex-none">
              <Info className="w-4 h-4 text-green-400" />
            </button>
          </div>
        </div>

        {/* Featured available places */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1rem' }}>바우처 이용 가능 추천 장소</h3>
            <button onClick={() => navigate('results')} className="text-green-600 flex items-center gap-0.5" style={{ fontSize: '0.78rem' }}>
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
            {featuredPlaces.map(place => (
              <PlaceCard key={place.id} place={place} onClick={() => onSelectPlace(place)} />
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <div>
              <p className="text-amber-800" style={{ fontWeight: 600, fontSize: '0.82rem' }}>바우처 이용 전 확인사항</p>
              <p className="text-amber-700 mt-1" style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                바우처 이용 가능 여부는 변경될 수 있습니다.
                방문 전 해당 시설에 직접 전화하여 확인하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>

        {/* Recent section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1rem' }}>최근 많이 찾는 장소</h3>
          </div>
          <div className="space-y-2">
            {recentPlaces.map((place, idx) => {
              const status = voucherStatusConfig[place.voucherStatus];
              return (
                <button
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <span className="text-gray-400 w-5 text-center" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-gray-800" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{place.name}</p>
                    <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>{place.region} · {place.type}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor}`} style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                    {status.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Saved trips shortcut */}
        {favorites.length > 0 && (
          <button
            onClick={() => navigate('favorites')}
            className="w-full bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-left flex-1">
              <p className="text-rose-800" style={{ fontWeight: 600, fontSize: '0.88rem' }}>관심 장소 {favorites.length}개</p>
              <p className="text-rose-500" style={{ fontSize: '0.75rem' }}>저장한 장소를 확인하세요</p>
            </div>
            <ChevronRight className="w-5 h-5 text-rose-300" />
          </button>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
