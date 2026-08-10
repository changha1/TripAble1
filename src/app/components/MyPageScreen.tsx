import { ChevronRight, LogIn, LogOut, User, CreditCard, Bookmark, Heart, Bell, Shield, HelpCircle, Info } from 'lucide-react';
import type { Screen } from './types';

interface MyPageScreenProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  navigate: (screen: Screen) => void;
}

function MenuItem({ icon, label, desc, onClick, badge }: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  onClick?: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50 active:bg-gray-50 transition-colors px-5"
    >
      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-none">
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-gray-800" style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</p>
        {desc && <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>{desc}</p>}
      </div>
      {badge && (
        <span className="bg-red-500 text-white rounded-full px-2 py-0.5" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-300 flex-none" />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-gray-50 px-5 py-2.5">
      <p className="text-gray-400" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{title}</p>
    </div>
  );
}

export function MyPageScreen({ isLoggedIn, onLogin, onLogout, navigate }: MyPageScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">
      {/* Profile area */}
      <div className="bg-white px-5 pt-6 pb-5 border-b border-gray-100">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '1.1rem' }}>홍길동</p>
              <p className="text-gray-400" style={{ fontSize: '0.8rem' }}>gildong@example.com</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-0.5" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  💳 문화누리카드
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 flex items-center gap-1"
              style={{ fontSize: '0.78rem' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-600" style={{ fontWeight: 600, fontSize: '0.95rem' }}>로그인이 필요합니다</p>
            <p className="text-gray-400 mt-1 mb-4" style={{ fontSize: '0.8rem' }}>
              로그인하면 바우처 정보 저장, 맞춤 추천 등을 이용할 수 있습니다.
            </p>
            <button
              onClick={onLogin}
              className="w-full max-w-xs bg-green-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              <LogIn className="w-4 h-4" />
              로그인 / 회원가입
            </button>
            <p className="text-gray-400 mt-3" style={{ fontSize: '0.75rem' }}>
              비회원으로도 기본 검색을 이용할 수 있습니다
            </p>
          </div>
        )}
      </div>

      {/* My vouchers */}
      {isLoggedIn && (
        <>
          <SectionHeader title="내 바우처" />
          <div className="bg-white">
            <div className="px-5 py-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-none">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>문화누리카드</p>
                  <p className="text-gray-500" style={{ fontSize: '0.75rem' }}>2026년 12월 31일 만료</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '54%' }} />
                    </div>
                    <span className="text-green-600" style={{ fontWeight: 700, fontSize: '0.78rem' }}>70,000원 남음</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-3 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-gray-400 flex items-center justify-center gap-2"
                style={{ fontSize: '0.82rem' }}>
                + 바우처 추가
              </button>
            </div>
          </div>
        </>
      )}

      {/* My activity */}
      <SectionHeader title="내 활동" />
      <div className="bg-white">
        <MenuItem
          icon={<Bookmark className="w-4 h-4 text-gray-500" />}
          label="저장한 여행"
          desc="저장한 여행 계획"
          onClick={() => navigate('saved-trips')}
        />
        <MenuItem
          icon={<Heart className="w-4 h-4 text-gray-500" />}
          label="관심 장소"
          desc="저장한 관광지 목록"
          onClick={() => navigate('favorites')}
        />
      </div>

      {/* Settings */}
      <SectionHeader title="설정" />
      <div className="bg-white">
        <MenuItem
          icon={<Bell className="w-4 h-4 text-gray-500" />}
          label="알림 설정"
          desc="공지 및 업데이트 알림"
        />
        <MenuItem
          icon={<Shield className="w-4 h-4 text-gray-500" />}
          label="개인정보 처리방침"
        />
      </div>

      {/* Info */}
      <SectionHeader title="서비스 정보" />
      <div className="bg-white">
        <MenuItem
          icon={<HelpCircle className="w-4 h-4 text-gray-500" />}
          label="서비스 이용 안내"
          onClick={() => navigate('guide')}
        />
        <MenuItem
          icon={<Info className="w-4 h-4 text-gray-500" />}
          label="TripAble 소개"
          desc="버전 1.0.0"
        />
      </div>

      {/* App info */}
      <div className="px-5 py-8 text-center">
        <p className="text-green-600" style={{ fontWeight: 700, fontSize: '0.9rem' }}>TripAble</p>
        <p className="text-gray-400 mt-1" style={{ fontSize: '0.72rem' }}>
          복지 바우처로 떠나는 맞춤 여행 서비스
        </p>
        <p className="text-gray-300 mt-3" style={{ fontSize: '0.68rem' }}>
          관광 정보 출처: 한국관광공사 TourAPI<br />
          문화누리카드 정보: 한국문화예술위원회
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}
