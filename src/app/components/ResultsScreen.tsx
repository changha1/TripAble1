import { useState } from 'react';
import {
  ChevronLeft, SlidersHorizontal, MapPin, Star, Heart,
  CheckCircle2, AlertCircle, HelpCircle, XCircle, Map, List,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import type { Place, TripInput, Screen } from './types';
import { voucherStatusConfig, type VoucherStatus } from './types';

interface ResultsScreenProps {
  results: Place[];
  tripInput: TripInput;
  onSelectPlace: (place: Place) => void;
  onToggleFavorite: (place: Place) => void;
  isFavorite: (id: string) => boolean;
  onCreatePlan: (places: Place[]) => void;
  onBack: () => void;
  navigate: (screen: Screen) => void;
  suggestions?: string[];
}


const STATUS_ICONS: Record<VoucherStatus, React.ReactNode> = {
  available: <CheckCircle2 className="w-3.5 h-3.5" />,
  conditional: <AlertCircle className="w-3.5 h-3.5" />,
  check: <HelpCircle className="w-3.5 h-3.5" />,
  unavailable: <XCircle className="w-3.5 h-3.5" />,
};

const FILTER_OPTIONS = [
  { id: 'all', label: '전체' },
  { id: 'available', label: '이용 가능만' },
  { id: 'low-self-pay', label: '본인부담 낮은 순' },
  { id: 'distance', label: '거리순' },
  { id: 'rating', label: '평점 높은 순' },
];

function StatusBadge({ status }: { status: VoucherStatus }) {
  const cfg = voucherStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`}
      style={{ fontSize: '0.7rem', fontWeight: 600 }}>
      {STATUS_ICONS[status]}
      {cfg.shortLabel}
    </span>
  );
}

function PlaceCard({
  place,
  onClick,
  onToggleFavorite,
  isFav,
  isSelected,
  onToggleSelect,
  compareMode,
}: {
  place: Place;
  onClick: () => void;
  onToggleFavorite: () => void;
  isFav: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  compareMode: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
        isSelected && compareMode ? 'border-green-500' : 'border-gray-100'
      }`}
    >
      <div className="relative" onClick={onClick}>
        <img src={place.image} alt={place.name} className="w-full h-40 object-cover cursor-pointer" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={place.voucherStatus} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                {place.type}
              </span>
              <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>
                <MapPin className="w-3 h-3 inline mr-0.5" />{place.region} {place.city}
              </span>
            </div>
            <h3 className="text-gray-800 mb-1.5" style={{ fontWeight: 700, fontSize: '1rem' }}>{place.name}</h3>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-gray-700" style={{ fontWeight: 600, fontSize: '0.78rem' }}>{place.rating}</span>
                <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>({place.reviewCount.toLocaleString()})</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500" style={{ fontSize: '0.75rem' }}>
                <MapPin className="w-3 h-3 inline mr-0.5" />{place.distance > 0 ? `${place.distance}km` : '위치 확인'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                <p className="text-gray-400" style={{ fontSize: '0.68rem' }}>입장료</p>
                <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {place.entryFee === 0 ? '무료' : `${place.entryFee.toLocaleString()}원`}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                <p className="text-gray-400" style={{ fontSize: '0.68rem' }}>본인부담</p>
                <p className={`${place.selfPay === 0 ? 'text-green-600' : 'text-gray-800'}`}
                  style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {place.selfPay === 0 ? '없음' : `${place.selfPay.toLocaleString()}원`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {place.accessibility.wheelchair && (
            <span className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem' }}>♿ 휠체어</span>
          )}
          {place.accessibility.disabledToilet && (
            <span className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem' }}>🚻 장애인화장실</span>
          )}
          {place.accessibility.elevator && (
            <span className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem' }}>🛗 엘리베이터</span>
          )}
          {place.accessibility.babyFacility && (
            <span className="bg-purple-50 text-purple-600 rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem' }}>👶 유아시설</span>
          )}
        </div>

        {/* Voucher status detail */}
        <div className={`mt-3 rounded-xl p-2.5 ${voucherStatusConfig[place.voucherStatus].bgColor}`}>
          <p className={voucherStatusConfig[place.voucherStatus].textColor} style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>
            {STATUS_ICONS[place.voucherStatus]}
            {' '}{place.voucherStatusDetail}
          </p>
        </div>

        {compareMode && (
          <button
            onClick={onToggleSelect}
            className={`mt-3 w-full rounded-xl py-2 border-2 transition-all ${
              isSelected
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600'
            }`}
            style={{ fontSize: '0.82rem', fontWeight: 600 }}
          >
            {isSelected ? '✓ 비교 선택됨' : '비교에 추가'}
          </button>
        )}
      </div>
    </div>
  );
}

function InputSummaryBar({ input }: { input: TripInput }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      onClick={() => setExpanded(e => !e)}
      className="w-full bg-green-50 border-b border-green-100 px-5 py-3 text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {input.voucher && (
            <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
              {input.voucher.name}
            </span>
          )}
          {input.region && (
            <span className="bg-white text-gray-600 rounded-full px-2 py-0.5 border border-gray-200" style={{ fontSize: '0.7rem' }}>
              📍 {input.region}
            </span>
          )}
          {input.startDate && (
            <span className="bg-white text-gray-600 rounded-full px-2 py-0.5 border border-gray-200" style={{ fontSize: '0.7rem' }}>
              📅 {input.startDate}
            </span>
          )}
          <span className="bg-white text-gray-600 rounded-full px-2 py-0.5 border border-gray-200" style={{ fontSize: '0.7rem' }}>
            👥 {input.partySize}명
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: '잔액', value: input.balance > 0 ? `${input.balance.toLocaleString()}원` : '미입력' },
            { label: '기간', value: input.duration === 'day' ? '당일치기' : '1박2일' },
            { label: '본인부담', value: input.selfPayBudget === 0 ? '없음' : `최대 ${input.selfPayBudget.toLocaleString()}원` },
            { label: '관광 유형', value: input.tourismTypes.length > 0 ? `${input.tourismTypes.length}개 선택` : '전체' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg p-2">
              <p className="text-gray-400" style={{ fontSize: '0.68rem' }}>{label}</p>
              <p className="text-gray-700" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

function StatusSummary({ results }: { results: Place[] }) {
  const counts = {
    available: results.filter(p => p.voucherStatus === 'available').length,
    conditional: results.filter(p => p.voucherStatus === 'conditional').length,
    check: results.filter(p => p.voucherStatus === 'check').length,
    unavailable: results.filter(p => p.voucherStatus === 'unavailable').length,
  };

  return (
    <div className="grid grid-cols-4 gap-2 px-5 py-3 bg-white border-b border-gray-100">
      {(Object.keys(counts) as VoucherStatus[]).map(status => {
        const cfg = voucherStatusConfig[status];
        return (
          <div key={status} className={`rounded-xl p-2 text-center ${cfg.bgColor}`}>
            <p className={cfg.textColor} style={{ fontSize: '1rem', fontWeight: 700 }}>{counts[status]}</p>
            <p className={cfg.textColor} style={{ fontSize: '0.62rem', lineHeight: 1.3 }}>{cfg.shortLabel}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ResultsScreen({
  results,
  tripInput,
  onSelectPlace,
  onToggleFavorite,
  isFavorite,
  onCreatePlan,
  onBack,
  suggestions,
}: ResultsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Place[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = results.filter(p => {
    if (activeFilter === 'available') return p.voucherStatus === 'available';
    return true;
  }).sort((a, b) => {
    if (activeFilter === 'low-self-pay') return a.selfPay - b.selfPay;
    if (activeFilter === 'distance') return a.distance - b.distance;
    if (activeFilter === 'rating') return b.rating - a.rating;
    return 0;
  });

  const toggleCompareSelect = (place: Place) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(p => p.id === place.id);
      if (exists) return prev.filter(p => p.id !== place.id);
      if (prev.length >= 3) return prev;
      return [...prev, place];
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>추천 결과</p>
            <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>총 {results.length}개 장소</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              {viewMode === 'list' ? <Map className="w-4 h-4 text-gray-600" /> : <List className="w-4 h-4 text-gray-600" />}
            </button>
            <button
              onClick={() => { setCompareMode(m => !m); setSelectedForCompare([]); }}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                compareMode ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-100 border-transparent text-gray-600'
              }`}
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              비교
            </button>
          </div>
        </div>

        <InputSummaryBar input={tripInput} />
        <StatusSummary results={results} />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto px-5 py-3 pb-3" style={{ scrollbarWidth: 'none' }}>
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`flex-none rounded-full px-4 py-1.5 border transition-all ${
                activeFilter === opt.id
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            >
              {opt.label}
            </button>
          ))}
          <button className="flex-none rounded-full px-3 py-1.5 border border-gray-200 bg-white text-gray-500 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span style={{ fontSize: '0.78rem' }}>더보기</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'map' ? (
          <div className="h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
            <Map className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500" style={{ fontWeight: 600, fontSize: '0.9rem' }}>지도 보기</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: '0.8rem' }}>
              검색된 {results.length}개 장소를<br />지도에서 확인할 수 있습니다.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
              {results.slice(0, 4).map(p => {
                const cfg = voucherStatusConfig[p.voucherStatus];
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlace(p)}
                    className="bg-white rounded-xl p-3 flex items-center gap-3 text-left"
                  >
                    <div className={`w-2 h-2 rounded-full ${cfg.dotColor}`} />
                    <span className="flex-1 text-gray-700" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</span>
                    <span className={`${cfg.textColor}`} style={{ fontSize: '0.7rem' }}>{cfg.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <RefreshCw className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-600 mb-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  현재 조건과 일치하는 장소를 찾지 못했어요
                </p>
                {suggestions && suggestions.length > 0 ? (
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mt-3 text-left w-full">
                    <p className="text-green-800 font-bold mb-1.5" style={{ fontSize: '0.82rem' }}>💡 검색 조건 조정 제안</p>
                    <ul className="text-green-700 space-y-1.5" style={{ fontSize: '0.78rem' }}>
                      {suggestions.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-400 mt-2 max-w-xs" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                    여행 지역을 넓히거나 본인부담 가능 금액을 조정해 보세요.
                  </p>
                )}
              </div>
            ) : (
              filtered.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={() => onSelectPlace(place)}
                  onToggleFavorite={() => onToggleFavorite(place)}
                  isFav={isFavorite(place.id)}
                  isSelected={selectedForCompare.some(p => p.id === place.id)}
                  onToggleSelect={() => toggleCompareSelect(place)}
                  compareMode={compareMode}
                />
              ))
            )}
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* Compare bar / Create plan bar */}
      {compareMode && selectedForCompare.length > 0 ? (
        <div className="bg-white border-t border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            {selectedForCompare.map(p => (
              <div key={p.id} className="flex-1 bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-gray-700 truncate" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{p.name}</p>
              </div>
            ))}
            {selectedForCompare.length < 3 && (
              <div className="flex-1 bg-gray-100 rounded-xl p-2 flex items-center justify-center" style={{ minHeight: 48 }}>
                <span className="text-gray-300" style={{ fontSize: '1.2rem' }}>+</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onCreatePlan(selectedForCompare)}
            className="w-full bg-green-600 text-white rounded-2xl py-3.5"
            style={{ fontWeight: 700, fontSize: '0.9rem' }}
          >
            {selectedForCompare.length}개 장소로 여행 계획 만들기
          </button>
        </div>
      ) : (
        !compareMode && filtered.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-5 py-4">
            <button
              onClick={() => onCreatePlan(filtered.filter(p => p.voucherStatus !== 'unavailable').slice(0, 3))}
              className="w-full bg-green-600 text-white rounded-2xl py-3.5"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              맞춤 여행 계획 만들기
            </button>
          </div>
        )
      )}
    </div>
  );
}
