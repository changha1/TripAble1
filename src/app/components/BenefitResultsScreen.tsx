import { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ExternalLink, HelpCircle } from 'lucide-react';
import { BENEFIT_CATALOG, BENEFIT_CATEGORY_LABELS, findBenefit } from '../data/benefits';
import type { BenefitEligibility, BenefitEligibilityMatch, UserBenefit, WelfareProfile } from './types';

interface BenefitResultsScreenProps {
  profile: WelfareProfile;
  matches: BenefitEligibilityMatch[];
  onContinue: (benefits: UserBenefit[]) => void;
  onBack: () => void;
}

const ELIGIBILITY_LABELS: Record<BenefitEligibility, string> = {
  likely: '대상일 가능성 있음', possible: '참여 여부 확인', check: '조건 확인 필요', 'not-eligible': '현재 조건과 다름',
};

export function BenefitResultsScreen({ profile, matches, onContinue, onBack }: BenefitResultsScreenProps) {
  // Eligibility is only a candidate signal. Users must explicitly register benefits they actually hold.
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const visibleMatches = matches.filter(match => match.eligibility !== 'not-eligible');

  const toggle = (benefitId: string) => {
    setSelectedIds(current => current.includes(benefitId) ? current.filter(id => id !== benefitId) : [...current, benefitId]);
  };

  const continueWithBenefits = () => {
    onContinue(selectedIds.map(benefitId => ({
      benefitId,
      enabled: true,
      owned: true,
      balance: balances[benefitId] ? Number(balances[benefitId]) : undefined,
    })));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="뒤로" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>찾은 여행복지</p>
          <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>{profile.residenceRegion} 기준 후보</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <p className="text-green-600 mb-1" style={{ fontSize: '0.78rem', fontWeight: 700 }}>2 / 2 단계</p>
          <h1 className="text-gray-900" style={{ fontSize: '1.35rem', fontWeight: 800 }}>받을 가능성이 있는<br />여행복지를 확인하세요</h1>
          <p className="text-gray-500 mt-2" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            선택한 혜택이 실제로 발급·선정되었는지 확인한 뒤 보유 혜택으로 등록하세요.
          </p>
        </div>

        {visibleMatches.map(match => {
          const benefit = findBenefit(match.benefitId);
          if (!benefit) return null;
          const selected = selectedIds.includes(match.benefitId);
          const isBalance = benefit.category === 'balance';
          return (
            <section key={match.benefitId} className={`bg-white rounded-2xl border-2 p-4 ${selected ? 'border-green-500' : 'border-gray-200'}`}>
              <button onClick={() => toggle(match.benefitId)} className="w-full flex items-start gap-3 text-left">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-none ${selected ? 'bg-green-600' : 'border-2 border-gray-300'}`}>
                  {selected && <Check className="w-4 h-4 text-white" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-800" style={{ fontWeight: 800, fontSize: '0.92rem' }}>{benefit.name}</span>
                    <span className="text-gray-500 bg-gray-100 rounded-full px-2 py-0.5" style={{ fontSize: '0.65rem' }}>{BENEFIT_CATEGORY_LABELS[benefit.category]}</span>
                  </span>
                  <span className="block text-green-700 mt-1" style={{ fontSize: '0.78rem', fontWeight: 700 }}>{benefit.amountLabel}</span>
                  <span className="block text-gray-500 mt-1" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>{match.reason}</span>
                </span>
              </button>

              {selected && isBalance && (
                <div className="mt-3 pl-9">
                  <label className="text-gray-600 block mb-1" style={{ fontSize: '0.72rem', fontWeight: 700 }}>현재 보유 잔액</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={balances[match.benefitId] || ''}
                      onChange={event => setBalances(current => ({ ...current, [match.benefitId]: event.target.value }))}
                      placeholder="확인 후 입력"
                      className="w-full bg-gray-100 rounded-xl px-3 py-2.5 pr-10 text-gray-800 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '0.75rem' }}>원</span>
                  </div>
                </div>
              )}

              <div className="mt-3 pl-9 flex items-center justify-between gap-2">
                <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: '0.68rem' }}>
                  {match.eligibility === 'likely' ? <Check className="w-3 h-3 text-green-600" /> : <HelpCircle className="w-3 h-3" />}
                  {ELIGIBILITY_LABELS[match.eligibility]} · 최종 확인 필요
                </span>
                <a href={benefit.sourceUrl} target="_blank" rel="noreferrer" className="text-green-700 flex items-center gap-1" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                  출처 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </section>
          );
        })}

        {visibleMatches.length === 0 && (
          <div className="bg-white rounded-2xl p-5 text-center text-gray-500" style={{ fontSize: '0.82rem' }}>
            입력 조건으로 바로 추천할 수 있는 혜택이 없습니다. 지역 공고를 확인해 보세요.
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 p-5">
        <button
          onClick={continueWithBenefits}
          disabled={selectedIds.length === 0}
          className={`w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold ${selectedIds.length ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}
        >
          보유 혜택으로 여행 찾기 <ArrowRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
