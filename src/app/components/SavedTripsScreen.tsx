import { Bookmark, ChevronRight, Calendar, MapPin, CreditCard, Search } from 'lucide-react';
import type { TripPlan, Screen } from './types';

interface SavedTripsScreenProps {
  savedTrips: TripPlan[];
  onSelectTrip: (plan: TripPlan) => void;
  navigate: (screen: Screen) => void;
}

export function SavedTripsScreen({ savedTrips, onSelectTrip, navigate }: SavedTripsScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-5 py-5">
        <h2 className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.2rem' }}>저장한 여행</h2>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.8rem' }}>총 {savedTrips.length}개의 여행 계획</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {savedTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <Bookmark className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-600" style={{ fontWeight: 600, fontSize: '1rem' }}>저장된 여행 계획이 없습니다</p>
            <p className="text-gray-400 mt-2 max-w-xs" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              맞춤 여행 계획을 만들고 저장하면 여기서 확인할 수 있습니다.
            </p>
            <button
              onClick={() => navigate('trip-finder')}
              className="mt-6 bg-green-600 text-white rounded-2xl px-6 py-3 flex items-center gap-2"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              <Search className="w-4 h-4" />
              여행 찾기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedTrips.map(plan => (
              <button
                key={plan.id}
                onClick={() => onSelectTrip(plan)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left active:scale-95 transition-transform"
              >
                <div className="relative h-32">
                  <img
                    src={plan.places[0]?.image}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>{plan.title}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span style={{ fontSize: '0.78rem' }}>{plan.travelDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span style={{ fontSize: '0.78rem' }}>장소 {plan.places.length}곳</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-green-50 rounded-xl px-3 py-2">
                      <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>바우처 사용</p>
                      <p className="text-green-600" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {plan.totalVoucherAmount.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>본인부담</p>
                      <p className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {plan.totalSelfPay === 0 ? '없음' : `${plan.totalSelfPay.toLocaleString()}원`}
                      </p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>기간</p>
                      <p className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {plan.duration === 'day' ? '당일치기' : '1박2일'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1 flex-wrap">
                      {plan.places.slice(0, 3).map(p => (
                        <span key={p.id} className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-none" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
