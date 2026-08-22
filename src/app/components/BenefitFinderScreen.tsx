import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, MapPin, UserRound } from 'lucide-react';
import { REGIONS } from './mockData';
import type { WelfareProfile } from './types';

export const DEFAULT_WELFARE_PROFILE: WelfareProfile = {
  residenceRegion: '',
  residenceCity: '',
  age: undefined,
  basicLivelihoodRecipient: false,
  nearPoverty: false,
  disabled: false,
  disabilityPensionRecipient: false,
  disabilityAllowanceRecipient: false,
  disabledChildAllowanceRecipient: false,
  singleParentFamily: false,
  veteran: false,
  multiChildFamily: false,
  infantCompanion: false,
  socialWelfareFacilityUser: false,
  worker: false,
};

interface BenefitFinderScreenProps {
  initialProfile?: WelfareProfile;
  onComplete: (profile: WelfareProfile) => void;
  onBack: () => void;
}

const OPTIONS: { key: keyof WelfareProfile; label: string; description: string }[] = [
  { key: 'basicLivelihoodRecipient', label: '기초생활수급자', description: '생계·의료·주거·교육급여 등' },
  { key: 'nearPoverty', label: '차상위계층', description: '차상위 확인서·장애수당 등' },
  { key: 'disabled', label: '등록 장애인', description: '장애인등록증(복지카드) 보유' },
  { key: 'disabilityPensionRecipient', label: '장애인연금 수급자', description: '산림복지 이용권 후보 조건' },
  { key: 'disabilityAllowanceRecipient', label: '장애수당 수급자', description: '산림복지 이용권 후보 조건' },
  { key: 'disabledChildAllowanceRecipient', label: '장애아동수당 수급자', description: '산림복지 이용권 후보 조건' },
  { key: 'singleParentFamily', label: '한부모가족', description: '가족지원·산림복지 후보 조건' },
  { key: 'veteran', label: '국가유공자·보훈대상자', description: '시설별 감면 확인 후보' },
  { key: 'multiChildFamily', label: '다자녀 가정', description: '지역·시설별 감면 확인 후보' },
  { key: 'infantCompanion', label: '영유아 동반', description: '접근성·편의시설 추천에 반영' },
  { key: 'socialWelfareFacilityUser', label: '사회복지시설 이용자', description: '단체 산림복지 프로그램 확인 후보' },
  { key: 'worker', label: '근로자', description: '근로자 휴가지원사업 참여 여부 확인' },
];

export function BenefitFinderScreen({ initialProfile = DEFAULT_WELFARE_PROFILE, onComplete, onBack }: BenefitFinderScreenProps) {
  const [profile, setProfile] = useState<WelfareProfile>(initialProfile);
  const toggle = (key: keyof WelfareProfile) => {
    setProfile(previous => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="뒤로" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>여행복지 찾기</p>
          <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>입력한 조건은 후보 추천에만 사용합니다.</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <p className="text-green-600 mb-1" style={{ fontSize: '0.78rem', fontWeight: 700 }}>1 / 2 단계</p>
          <h1 className="text-gray-900" style={{ fontSize: '1.35rem', fontWeight: 800 }}>내 조건으로 받을 수 있는<br />여행복지를 찾아보세요</h1>
          <p className="text-gray-500 mt-2" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
            행정정보를 조회하거나 수급 여부를 확정하지 않습니다. 입력한 조건을 바탕으로 확인할 제도를 찾아드립니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            <MapPin className="w-4 h-4 text-green-600" /> 거주지역
          </div>
          <select
            value={profile.residenceRegion}
            onChange={event => setProfile(previous => ({ ...previous, residenceRegion: event.target.value }))}
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 outline-none"
          >
            <option value="">시·도를 선택하세요</option>
            {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
          </select>
          <input
            value={profile.residenceCity || ''}
            onChange={event => setProfile(previous => ({ ...previous, residenceCity: event.target.value }))}
            placeholder="시·군·구 (선택)"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
            <UserRound className="w-4 h-4 text-green-600" /> 나이
          </div>
          <input
            type="number"
            min="0"
            max="120"
            value={profile.age ?? ''}
            onChange={event => setProfile(previous => ({ ...previous, age: event.target.value ? Number(event.target.value) : undefined }))}
            placeholder="만 나이 (선택)"
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-800 outline-none"
          />
          <p className="text-gray-400" style={{ fontSize: '0.7rem' }}>만 65세 이상이면 경로우대 후보로 자동 표시합니다.</p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>해당하는 조건을 모두 선택하세요</p>
          {OPTIONS.map(option => {
            const selected = profile[option.key] === true;
            return (
              <button
                key={option.key}
                onClick={() => toggle(option.key)}
                className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-colors ${selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-none ${selected ? 'bg-green-600' : 'border-2 border-gray-300'}`}>
                  {selected && <Check className="w-4 h-4 text-white" />}
                </span>
                <span className="flex-1">
                  <span className="block text-gray-800" style={{ fontSize: '0.86rem', fontWeight: 700 }}>{option.label}</span>
                  <span className="block text-gray-500 mt-0.5" style={{ fontSize: '0.72rem' }}>{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 p-5">
        <button
          onClick={() => onComplete(profile)}
          disabled={!profile.residenceRegion}
          className={`w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold ${profile.residenceRegion ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}
        >
          혜택 찾아보기 <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
