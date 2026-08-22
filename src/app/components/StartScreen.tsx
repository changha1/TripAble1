import { MapPin, Accessibility, CreditCard, Heart } from 'lucide-react';
import { VOUCHERS } from './mockData';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="h-full flex flex-col overflow-y-auto bg-gradient-to-b from-green-700 to-green-900">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-white text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <MapPin className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-white mb-1" style={{ fontSize: '2rem', fontWeight: 700 }}>TripAble</h1>
          <p className="text-green-200" style={{ fontSize: '1rem' }}>내 바우처로 떠나는 맞춤 여행</p>
        </div>

        <p className="text-green-100 mb-10 max-w-xs" style={{ fontSize: '0.9rem', lineHeight: '1.7' }}>
          문화누리카드와 관광 관련 복지·여행 지원 제도로 이용 가능한
          관광지·숙박시설을 쉽고 빠르게 찾아드립니다.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-10">
          {[
            { icon: CreditCard, label: '바우처 맞춤 검색', desc: '잔액 내 이용 가능한 곳만' },
            { icon: Accessibility, label: '편의시설 필터', desc: '휠체어·엘리베이터 등' },
            { icon: MapPin, label: '지역·날짜 선택', desc: '당일·1박2일 여행 계획' },
            { icon: Heart, label: '관심 장소 저장', desc: '나만의 여행 리스트' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-4 text-left backdrop-blur-sm">
              <Icon className="w-5 h-5 text-green-200 mb-2" strokeWidth={1.5} />
              <p className="text-white" style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{label}</p>
              <p className="text-green-300" style={{ fontSize: '0.7rem', marginTop: 2 }}>{desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="w-full max-w-xs bg-white text-green-700 rounded-2xl py-4 px-8 shadow-lg active:scale-95 transition-transform"
          style={{ fontWeight: 700, fontSize: '1rem' }}
        >
          시작하기
        </button>
        <p className="text-green-300 mt-4" style={{ fontSize: '0.75rem' }}>
          로그인 없이도 기본 검색을 이용할 수 있습니다
        </p>
      </div>

      {/* Voucher types */}
      <div className="bg-white/10 backdrop-blur-sm px-6 py-5">
        <p className="text-green-200 mb-3 text-center" style={{ fontSize: '0.75rem' }}>지원 바우처</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {VOUCHERS.map(({ name }) => (
            <span
              key={name}
              className="bg-white/20 text-white rounded-full px-3 py-1"
              style={{ fontSize: '0.72rem' }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
