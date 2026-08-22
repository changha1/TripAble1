import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Minus, Plus } from 'lucide-react';
import { BENEFIT_CATALOG, BENEFIT_CATEGORY_LABELS, findBenefit } from '../data/benefits';
import { ACCESSIBILITY_CONDITIONS, REGIONS, TOURISM_TYPES, TRANSPORTATION_OPTIONS } from './mockData';
import type { BenefitCategory, TripInput, UserBenefit, WelfareProfile } from './types';

interface TripFinderFlowProps {
  onSearch: (input: TripInput) => void;
  onBack: () => void;
  initialBenefits?: UserBenefit[];
  welfareProfile?: WelfareProfile;
}

const TOTAL_STEPS = 8;
const DEFAULT_INPUT: TripInput = {
  benefits: [],
  region: '',
  startDate: '',
  duration: 'day',
  partySize: 1,
  tourismTypes: [],
  transportation: [],
  accessibility: [],
  selfPayBudget: 30000,
  paymentPreference: 'both',
};

function StepLabel({ current, title, subtitle }: { current: number; title: string; subtitle: string }) {
  return (
    <div className="px-5 mb-6">
      <p className="text-green-600 mb-1" style={{ fontSize: '0.78rem', fontWeight: 700 }}>{current} / {TOTAL_STEPS} 단계</p>
      <h2 className="text-gray-800" style={{ fontWeight: 700 }}>{title}</h2>
      <p className="text-gray-500 mt-1" style={{ fontSize: '0.82rem' }}>{subtitle}</p>
    </div>
  );
}

function BenefitSelectionStep({ benefits, onChange }: { benefits: UserBenefit[]; onChange: (next: UserBenefit[]) => void }) {
  const toggle = (benefitId: string) => {
    const exists = benefits.some(benefit => benefit.benefitId === benefitId);
    onChange(exists
      ? benefits.filter(benefit => benefit.benefitId !== benefitId)
      : [...benefits, { benefitId, enabled: true, owned: true }]);
  };
  const categories: BenefitCategory[] = ['balance', 'discount', 'program'];
  return (
    <div className="px-5 space-y-4">
      <StepLabel current={1} title="실제로 보유한 혜택을 선택하세요" subtitle="여러 혜택을 함께 적용할 수 있습니다. 미보유 제도는 선택하지 마세요." />
      {categories.map(category => (
        <div key={category} className="space-y-2">
          <p className="text-gray-500" style={{ fontSize: '0.72rem', fontWeight: 700 }}>{BENEFIT_CATEGORY_LABELS[category]}</p>
          {BENEFIT_CATALOG.filter(benefit => benefit.category === category).map(benefit => {
            const selected = benefits.some(item => item.benefitId === benefit.id);
            return (
              <button
                key={benefit.id}
                onClick={() => toggle(benefit.id)}
                className={`w-full rounded-2xl p-4 border-2 text-left transition-all ${selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style={{ backgroundColor: `${benefit.color}20` }}>
                    {selected ? <Check className="w-5 h-5" style={{ color: benefit.color }} /> : <span className="text-lg">＋</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{benefit.name}</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{benefit.description}</p>
                    <p className="mt-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: benefit.color }}>{benefit.amountLabel}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function BalanceStep({ benefits, onChange }: { benefits: UserBenefit[]; onChange: (next: UserBenefit[]) => void }) {
  const updateBalance = (benefitId: string, balance: string) => {
    onChange(benefits.map(item => item.benefitId === benefitId ? { ...item, balance: Number(balance) || 0 } : item));
  };
  return (
    <div className="px-5 space-y-4">
      <StepLabel current={2} title="보유 혜택의 잔액을 등록하세요" subtitle="자격형 할인은 잔액 없이 적용 후보로 확인합니다." />
      {benefits.map(item => {
        const benefit = findBenefit(item.benefitId);
        if (!benefit) return null;
        if (benefit.category !== 'balance') {
          return (
            <div key={item.benefitId} className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <p className="text-purple-900" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{benefit.name}</p>
              <p className="text-purple-800 mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                {benefit.category === 'program' ? '일반 관광지 금액에서 자동 차감하지 않고, 휴가샵 또는 공식 공고 확인 필요로 표시합니다.' : '시설별 감면 기준이 확인된 경우에만 비용 계산에 반영합니다.'}
              </p>
            </div>
          );
        }
        return (
          <div key={item.benefitId} className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.88rem' }}>{benefit.name}</p>
            <div className="relative mt-3">
              <input
                type="number"
                min="0"
                value={item.balance ?? ''}
                onChange={event => updateBalance(item.benefitId, event.target.value)}
                placeholder="현재 잔액을 입력하세요"
                className="w-full bg-gray-100 rounded-xl px-4 py-3.5 pr-10 text-gray-800 outline-none focus:bg-green-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '0.8rem' }}>원</span>
            </div>
            <p className="text-gray-400 mt-1.5" style={{ fontSize: '0.7rem' }}>공식 앱·누리집에서 확인한 잔액만 입력해 주세요.</p>
          </div>
        );
      })}
    </div>
  );
}

function ChoiceGrid({ current, title, options, selected, onToggle }: { current: number; title: string; options: { id: string; name: string; emoji: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div className="px-5">
      <StepLabel current={current} title={title} subtitle="필요한 조건을 모두 선택해 주세요." />
      <div className="grid grid-cols-2 gap-3">
        {options.map(option => {
          const active = selected.includes(option.id);
          return (
            <button key={option.id} onClick={() => onToggle(option.id)} className={`rounded-2xl p-4 text-left border-2 ${active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <span className="text-xl">{option.emoji}</span>
              <p className={`mt-2 ${active ? 'text-green-700' : 'text-gray-700'}`} style={{ fontSize: '0.8rem', fontWeight: 700 }}>{option.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TripFinderFlow({ onSearch, onBack, initialBenefits = [], welfareProfile }: TripFinderFlowProps) {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<TripInput>({ ...DEFAULT_INPUT, benefits: initialBenefits, welfareProfile });
  const update = <K extends keyof TripInput>(key: K, value: TripInput[K]) => setInput(previous => ({ ...previous, [key]: value }));
  const toggleList = (key: 'tourismTypes' | 'transportation' | 'accessibility', id: string) => {
    const current = input[key];
    update(key, current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  };
  const hasBalance = input.benefits.some(item => findBenefit(item.benefitId)?.category === 'balance');
  const canProceed = () => {
    if (step === 1) return input.benefits.length > 0;
    if (step === 2) return !hasBalance || input.benefits.filter(item => findBenefit(item.benefitId)?.category === 'balance').every(item => item.balance !== undefined);
    if (step === 3) return input.region !== '';
    if (step === 4) return input.startDate !== '';
    return true;
  };
  const next = () => step === TOTAL_STEPS ? onSearch(input) : setStep(current => current + 1);
  const back = () => step === 1 ? onBack() : setStep(current => current - 1);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={back} aria-label="뒤로" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
        <p className="flex-1 text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>맞춤 여행 찾기</p>
        <button onClick={onBack} className="text-gray-400" style={{ fontSize: '0.8rem' }}>취소</button>
      </header>
      <div className="bg-white pt-4 pb-2 flex gap-1 px-5">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => <div key={index} className={`h-1 rounded-full flex-1 ${index < step ? 'bg-green-600' : 'bg-gray-200'}`} />)}
      </div>

      <main className="flex-1 overflow-y-auto py-4">
        {step === 1 && <BenefitSelectionStep benefits={input.benefits} onChange={benefits => update('benefits', benefits)} />}
        {step === 2 && <BalanceStep benefits={input.benefits} onChange={benefits => update('benefits', benefits)} />}
        {step === 3 && <div className="px-5"><StepLabel current={3} title="어디로 떠날까요?" subtitle="여행 지역을 선택해 주세요." /><div className="grid grid-cols-3 gap-2">{REGIONS.map(region => <button key={region} onClick={() => update('region', region)} className={`rounded-xl py-3 border-2 ${input.region === region ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`} style={{ fontSize: '0.8rem', fontWeight: 600 }}>{region}</button>)}</div></div>}
        {step === 4 && <div className="px-5 space-y-5"><StepLabel current={4} title="언제 떠날까요?" subtitle="여행 시작일과 기간을 선택해 주세요." /><input type="date" value={input.startDate} onChange={event => update('startDate', event.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 outline-none" /><div className="grid grid-cols-2 gap-3">{([{ value: 'day', label: '당일치기', emoji: '☀️' }, { value: 'overnight', label: '1박 2일', emoji: '🌙' }] as const).map(option => <button key={option.value} onClick={() => update('duration', option.value)} className={`rounded-2xl py-4 border-2 ${input.duration === option.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}><span className="text-xl">{option.emoji}</span><p className="text-gray-700 mt-1" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{option.label}</p></button>)}</div></div>}
        {step === 5 && <div className="px-5"><StepLabel current={5} title="몇 명이 함께하나요?" subtitle="동행 인원을 알려 주세요." /><div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between"><button onClick={() => update('partySize', Math.max(1, input.partySize - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button><span className="text-gray-800" style={{ fontWeight: 800, fontSize: '1.5rem' }}>{input.partySize}명</span><button onClick={() => update('partySize', Math.min(20, input.partySize + 1))} className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><Plus className="w-4 h-4" /></button></div></div>}
        {step === 6 && <ChoiceGrid current={6} title="어떤 여행을 원하세요?" options={TOURISM_TYPES} selected={input.tourismTypes} onToggle={id => toggleList('tourismTypes', id)} />}
        {step === 7 && <div className="px-5"><StepLabel current={7} title="필요한 편의조건을 선택하세요" subtitle="확인된 정보가 있는 장소를 우선 추천합니다." /><div className="space-y-2">{ACCESSIBILITY_CONDITIONS.map(option => <button key={option.id} onClick={() => toggleList('accessibility', option.id)} className={`w-full rounded-2xl p-4 flex items-center gap-3 border-2 text-left ${input.accessibility.includes(option.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}><span className="text-xl">{option.emoji}</span><span className="text-gray-700" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{option.name}</span></button>)}</div></div>}
        {step === 8 && <div className="px-5 space-y-5"><StepLabel current={8} title="추가로 낼 수 있는 금액은?" subtitle="혜택 적용 후 본인부담 예산을 설정하세요." /><div className="grid grid-cols-3 gap-2">{[0, 30000, 50000, 100000, 200000].map(amount => <button key={amount} onClick={() => update('selfPayBudget', amount)} className={`rounded-xl py-3 border-2 ${input.selfPayBudget === amount ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`} style={{ fontSize: '0.78rem', fontWeight: 700 }}>{amount === 0 ? '없음' : `${amount / 10000}만원`}</button>)}</div><div className="grid grid-cols-3 gap-2">{([{ value: 'online', label: '온라인' }, { value: 'offline', label: '현장' }, { value: 'both', label: '모두' }] as const).map(option => <button key={option.value} onClick={() => update('paymentPreference', option.value)} className={`rounded-xl py-3 border-2 ${input.paymentPreference === option.value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600'}`} style={{ fontSize: '0.78rem', fontWeight: 700 }}>{option.label}</button>)}</div><div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-800" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>장소별로 실제 사용 가능한 혜택만 계산하며, 확인되지 않은 할인·지원금은 본인부담 계산에서 확정하지 않습니다.</div></div>}
      </main>

      <footer className="bg-white border-t border-gray-100 p-5">
        {input.benefits.length > 0 && <div className="flex gap-2 overflow-x-auto mb-3">{input.benefits.map(item => <span key={item.benefitId} className="flex-none bg-green-100 text-green-700 rounded-full px-3 py-1" style={{ fontSize: '0.7rem', fontWeight: 700 }}>{findBenefit(item.benefitId)?.name}</span>)}</div>}
        <button onClick={next} disabled={!canProceed()} className={`w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold ${canProceed() ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>{step === TOTAL_STEPS ? '검색하기' : '다음'} {step < TOTAL_STEPS && <ChevronRight className="w-5 h-5" />}</button>
        {step >= 6 && <button onClick={next} className="w-full py-3 text-gray-400" style={{ fontSize: '0.8rem' }}>건너뛰기</button>}
      </footer>
    </div>
  );
}
