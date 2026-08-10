import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, Minus, Calendar } from 'lucide-react';
import type { TripInput, Voucher } from './types';
import { VOUCHERS, REGIONS, TOURISM_TYPES, TRANSPORTATION_OPTIONS, ACCESSIBILITY_CONDITIONS } from './mockData';

interface TripFinderFlowProps {
  onSearch: (input: TripInput) => void;
  onBack: () => void;
}

const TOTAL_STEPS = 8;

const DEFAULT_INPUT: TripInput = {
  voucher: null,
  balance: 0,
  endDate: '',
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

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1 px-5 mb-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 transition-all duration-300 ${
            i < step ? 'bg-green-600' : i === step - 1 ? 'bg-green-400' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function StepLabel({ current, total, title, subtitle }: {
  current: number; total: number; title: string; subtitle: string;
}) {
  return (
    <div className="px-5 mb-6">
      <p className="text-green-600 mb-1" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
        {current} / {total} 단계
      </p>
      <h2 className="text-gray-800" style={{ fontWeight: 700 }}>{title}</h2>
      <p className="text-gray-500 mt-1" style={{ fontSize: '0.82rem' }}>{subtitle}</p>
    </div>
  );
}

// Step 1: Voucher selection
function VoucherStep({ value, onChange }: { value: Voucher | null; onChange: (v: Voucher) => void }) {
  return (
    <div className="px-5 space-y-3">
      <StepLabel current={1} total={TOTAL_STEPS} title="보유 바우처를 선택하세요" subtitle="이용 중인 복지 바우처를 선택해 주세요." />
      {VOUCHERS.map(v => (
        <button
          key={v.id}
          onClick={() => onChange(v)}
          className={`w-full rounded-2xl p-4 border-2 text-left transition-all ${
            value?.id === v.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
              style={{ backgroundColor: v.color + '20' }}
            >
              <span style={{ fontSize: '1.2rem' }}>💳</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.name}</p>
                {value?.id === v.id && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>{v.description}</p>
              <p className="mt-1.5" style={{ fontSize: '0.75rem', fontWeight: 600, color: v.color }}>
                연간 최대 {v.maxAmount.toLocaleString()}원
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// Step 2: Balance input
function BalanceStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  const [displayBalance, setDisplayBalance] = useState(
    input.balance > 0 ? input.balance.toString() : ''
  );

  const handleBalanceChange = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, '');
    setDisplayBalance(numeric);
    onChange('balance', parseInt(numeric) || 0);
  };

  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={2}
        total={TOTAL_STEPS}
        title="바우처 잔액을 입력하세요"
        subtitle="남은 잔액과 사용 종료일을 입력해 주세요."
      />

      <div>
        <label className="text-gray-700 mb-2 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          남은 잔액 (원)
        </label>
        <div className="relative">
          <input
            type="number"
            value={displayBalance}
            onChange={e => handleBalanceChange(e.target.value)}
            placeholder="예: 70000"
            className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 outline-none focus:bg-green-50 focus:ring-2 focus:ring-green-300 transition-all"
            style={{ fontSize: '1rem' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: '0.85rem' }}>원</span>
        </div>
        {input.voucher && (
          <p className="text-gray-400 mt-1.5" style={{ fontSize: '0.72rem' }}>
            {input.voucher.name} 연간 최대 {input.voucher.maxAmount.toLocaleString()}원
          </p>
        )}
      </div>

      <div>
        <label className="text-gray-700 mb-2 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          사용 종료일
        </label>
        <input
          type="date"
          value={input.endDate}
          onChange={e => onChange('endDate', e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 outline-none focus:bg-green-50 focus:ring-2 focus:ring-green-300 transition-all"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="text-gray-700 mb-2 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>이용 선호 방식</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'online', label: '온라인', emoji: '💻' },
            { value: 'offline', label: '오프라인', emoji: '🏪' },
            { value: 'both', label: '모두', emoji: '✅' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange('paymentPreference', opt.value)}
              className={`rounded-xl py-3 flex flex-col items-center gap-1 border-2 transition-all ${
                input.paymentPreference === opt.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span style={{ fontSize: '1.2rem' }}>{opt.emoji}</span>
              <span className="text-gray-700" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Region selection
function RegionStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={3}
        total={TOTAL_STEPS}
        title="여행 지역을 선택하세요"
        subtitle="출발지와 희망 여행 지역을 선택해 주세요."
      />

      <div>
        <label className="text-gray-700 mb-2 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>희망 여행 지역</label>
        <div className="grid grid-cols-4 gap-2">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => onChange('region', region)}
              className={`rounded-xl py-2.5 text-center border-2 transition-all ${
                input.region === region
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
              style={{ fontSize: '0.82rem', fontWeight: 600 }}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4: Date & duration
function DateStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={4}
        total={TOTAL_STEPS}
        title="여행 날짜와 기간을 선택하세요"
        subtitle="출발 날짜와 여행 기간을 입력해 주세요."
      />

      <div>
        <label className="text-gray-700 mb-2 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          <Calendar className="w-4 h-4 inline mr-1.5 text-gray-500" />
          여행 날짜
        </label>
        <input
          type="date"
          value={input.startDate}
          onChange={e => onChange('startDate', e.target.value)}
          className="w-full bg-gray-100 rounded-xl px-4 py-3.5 text-gray-800 outline-none focus:bg-green-50 focus:ring-2 focus:ring-green-300 transition-all"
          min={today}
        />
      </div>

      <div>
        <label className="text-gray-700 mb-3 block" style={{ fontSize: '0.85rem', fontWeight: 600 }}>여행 기간</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'day', label: '당일치기', emoji: '☀️', desc: '하루 동안의 여행' },
            { value: 'overnight', label: '1박 2일', emoji: '🌙', desc: '숙박 포함 여행' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onChange('duration', opt.value)}
              className={`rounded-2xl p-5 text-left border-2 transition-all ${
                input.duration === opt.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="text-2xl mb-2">{opt.emoji}</div>
              <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: '0.75rem' }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 5: Party size
function PartySizeStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  return (
    <div className="px-5 space-y-6">
      <StepLabel
        current={5}
        total={TOTAL_STEPS}
        title="동행 인원을 입력하세요"
        subtitle="함께 여행하는 전체 인원을 입력해 주세요."
      />

      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <p className="text-gray-600 text-center mb-6" style={{ fontSize: '0.85rem' }}>총 여행 인원 (본인 포함)</p>
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => onChange('partySize', Math.max(1, input.partySize - 1))}
            disabled={input.partySize <= 1}
            className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform"
          >
            <Minus className="w-5 h-5 text-gray-700" />
          </button>
          <div className="text-center">
            <p className="text-green-600" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {input.partySize}
            </p>
            <p className="text-gray-400 mt-1" style={{ fontSize: '0.78rem' }}>명</p>
          </div>
          <button
            onClick={() => onChange('partySize', Math.min(20, input.partySize + 1))}
            disabled={input.partySize >= 20}
            className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
          <button
            key={n}
            onClick={() => onChange('partySize', n)}
            className={`rounded-xl py-2.5 border-2 transition-all ${
              input.partySize === n
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
            style={{ fontSize: '0.88rem', fontWeight: 600 }}
          >
            {n}명
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 6: Tourism types
function TourismTypesStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  const toggle = (id: string) => {
    const current = input.tourismTypes;
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    onChange('tourismTypes', updated);
  };

  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={6}
        total={TOTAL_STEPS}
        title="선호 관광 유형을 선택하세요"
        subtitle="여러 개를 선택할 수 있습니다. (선택 안 해도 됩니다)"
      />
      <div className="grid grid-cols-2 gap-3">
        {TOURISM_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`rounded-2xl p-4 text-left border-2 transition-all flex items-center gap-3 ${
              input.tourismTypes.includes(t.id)
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <span style={{ fontSize: '1.5rem' }}>{t.emoji}</span>
            <span className={`${input.tourismTypes.includes(t.id) ? 'text-green-700' : 'text-gray-700'}`}
              style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              {t.name}
            </span>
            {input.tourismTypes.includes(t.id) && (
              <Check className="w-4 h-4 text-green-500 ml-auto" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 7: Transportation & Accessibility
function AccessibilityStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  const toggleTransport = (id: string) => {
    const updated = input.transportation.includes(id)
      ? input.transportation.filter(x => x !== id)
      : [...input.transportation, id];
    onChange('transportation', updated);
  };
  const toggleAccess = (id: string) => {
    const updated = input.accessibility.includes(id)
      ? input.accessibility.filter(x => x !== id)
      : [...input.accessibility, id];
    onChange('accessibility', updated);
  };

  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={7}
        total={TOTAL_STEPS}
        title="이동 및 편의조건을 선택하세요"
        subtitle="필요한 조건을 선택해 주세요. (선택 안 해도 됩니다)"
      />

      <div>
        <p className="text-gray-700 mb-3" style={{ fontSize: '0.85rem', fontWeight: 600 }}>이동 조건</p>
        <div className="space-y-2">
          {TRANSPORTATION_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => toggleTransport(opt.id)}
              className={`w-full rounded-xl p-3.5 flex items-center gap-3 border-2 transition-all ${
                input.transportation.includes(opt.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span style={{ fontSize: '1.2rem' }}>{opt.emoji}</span>
              <span className={`flex-1 text-left ${input.transportation.includes(opt.id) ? 'text-green-700' : 'text-gray-700'}`}
                style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {opt.name}
              </span>
              {input.transportation.includes(opt.id) && <Check className="w-4 h-4 text-green-500" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-700 mb-3" style={{ fontSize: '0.85rem', fontWeight: 600 }}>편의조건</p>
        <div className="grid grid-cols-2 gap-2">
          {ACCESSIBILITY_CONDITIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => toggleAccess(opt.id)}
              className={`rounded-xl p-3 flex items-center gap-2 border-2 transition-all ${
                input.accessibility.includes(opt.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span style={{ fontSize: '1rem' }}>{opt.emoji}</span>
              <span className={`flex-1 text-left ${input.accessibility.includes(opt.id) ? 'text-green-700' : 'text-gray-700'}`}
                style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>
                {opt.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 8: Self-pay budget
function SelfPayStep({ input, onChange }: {
  input: TripInput;
  onChange: (field: keyof TripInput, value: unknown) => void;
}) {
  const budgetOptions = [0, 10000, 20000, 30000, 50000, 100000];

  return (
    <div className="px-5 space-y-5">
      <StepLabel
        current={8}
        total={TOTAL_STEPS}
        title="본인부담 가능 금액을 설정하세요"
        subtitle="바우처 외에 추가로 지불 가능한 금액을 설정하세요."
      />

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <p className="text-green-700 text-center" style={{ fontWeight: 700, fontSize: '1.5rem' }}>
          {input.selfPayBudget === 0 ? '부담 없이' : `최대 ${input.selfPayBudget.toLocaleString()}원`}
        </p>
        <p className="text-green-500 text-center mt-1" style={{ fontSize: '0.8rem' }}>
          {input.selfPayBudget === 0 ? '바우처 금액 내에서만 이용' : '본인부담 가능 금액'}
        </p>
      </div>

      <div>
        <input
          type="range"
          min={0}
          max={100000}
          step={5000}
          value={input.selfPayBudget}
          onChange={e => onChange('selfPayBudget', parseInt(e.target.value))}
          className="w-full accent-green-600"
        />
        <div className="flex justify-between text-gray-400 mt-1" style={{ fontSize: '0.72rem' }}>
          <span>0원</span>
          <span>10만원</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {budgetOptions.map(amount => (
          <button
            key={amount}
            onClick={() => onChange('selfPayBudget', amount)}
            className={`rounded-xl py-2.5 border-2 transition-all ${
              input.selfPayBudget === amount
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
            style={{ fontSize: '0.8rem', fontWeight: 600 }}
          >
            {amount === 0 ? '없음' : `${(amount / 10000).toFixed(0)}만원`}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-800" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>💡 이렇게 활용하세요</span><br />
          바우처 잔액과 본인부담금을 합산하여 이용 가능한 시설을 안내합니다.
          예산 범위에 맞는 맞춤 추천 결과를 제공합니다.
        </p>
      </div>
    </div>
  );
}

export function TripFinderFlow({ onSearch, onBack }: TripFinderFlowProps) {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<TripInput>(DEFAULT_INPUT);

  const updateField = (field: keyof TripInput, value: unknown) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return input.voucher !== null;
      case 2: return input.balance > 0;
      case 3: return input.region !== '';
      case 4: return input.startDate !== '';
      case 5: return input.partySize >= 1;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else onSearch(input);
  };

  const handleBack = () => {
    if (step === 1) onBack();
    else setStep(s => s - 1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={handleBack} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>맞춤 여행 찾기</p>
        </div>
        <button onClick={onBack} className="text-gray-400" style={{ fontSize: '0.8rem' }}>취소</button>
      </div>

      {/* Progress */}
      <div className="bg-white pt-4 pb-2">
        <ProgressBar step={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto py-4">
        {step === 1 && <VoucherStep value={input.voucher} onChange={v => updateField('voucher', v)} />}
        {step === 2 && <BalanceStep input={input} onChange={updateField} />}
        {step === 3 && <RegionStep input={input} onChange={updateField} />}
        {step === 4 && <DateStep input={input} onChange={updateField} />}
        {step === 5 && <PartySizeStep input={input} onChange={updateField} />}
        {step === 6 && <TourismTypesStep input={input} onChange={updateField} />}
        {step === 7 && <AccessibilityStep input={input} onChange={updateField} />}
        {step === 8 && <SelfPayStep input={input} onChange={updateField} />}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-100 p-5">
        {/* Summary chips for context */}
        {step > 1 && (
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: 'none' }}>
            {input.voucher && (
              <span className="flex-none bg-green-100 text-green-700 rounded-full px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                {input.voucher.name}
              </span>
            )}
            {input.balance > 0 && (
              <span className="flex-none bg-blue-100 text-blue-700 rounded-full px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                잔액 {input.balance.toLocaleString()}원
              </span>
            )}
            {input.region && (
              <span className="flex-none bg-purple-100 text-purple-700 rounded-full px-3 py-1" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                📍 {input.region}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full rounded-2xl py-4 flex items-center justify-center gap-2 transition-all ${
            canProceed()
              ? 'bg-green-600 text-white active:scale-95'
              : 'bg-gray-200 text-gray-400'
          }`}
          style={{ fontWeight: 700, fontSize: '1rem' }}
        >
          {step === TOTAL_STEPS ? (
            <>검색하기</>
          ) : (
            <>다음 <ChevronRight className="w-5 h-5" /></>
          )}
        </button>

        {[6, 7, 8].includes(step) && (
          <button
            onClick={handleNext}
            className="w-full mt-2 py-3 text-gray-400"
            style={{ fontSize: '0.85rem' }}
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
