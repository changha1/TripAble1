import { useState } from 'react';
import { ChevronDown, ChevronLeft, ExternalLink } from 'lucide-react';
import { BENEFIT_CATALOG, BENEFIT_CATEGORY_LABELS } from '../data/benefits';

interface GuideScreenProps {
  onBack: () => void;
}

const GUIDE_SECTIONS = [
  { title: 'TripAble은 어떤 서비스인가요?', content: 'TripAble은 사용자가 선택한 여행복지와 접근성 조건을 관광지 정보에 연결해 실제로 이용 가능한 장소와 예상 본인부담금을 함께 보여주는 서비스입니다. 행정정보를 대신 확인하거나 혜택 지급을 보장하지 않으므로 최종 이용 전 공식 안내와 시설에 확인해야 합니다.' },
  { title: '여행복지는 어떻게 구분하나요?', content: '금액형은 등록한 잔액 범위에서 장소 이용료를 차감합니다. 자격형은 시설별 감면 기준과 본인 자격이 확인될 때만 할인으로 반영합니다. 프로그램형은 휴가샵이나 별도 운영기관에서 사용할 수 있는 제도라 일반 관광지 금액에서 자동 차감하지 않습니다.' },
  { title: '여행 비용은 어떻게 계산하나요?', content: '확인된 입장료에서 자격형 할인, 등록한 금액형 잔액 순으로 적용합니다. 확인되지 않은 가격이나 사용처는 무료로 간주하지 않고 확인 필요 상태로 남깁니다. 여러 금액형 혜택을 선택하면 우선순위 순서대로 잔액을 사용합니다.' },
  { title: '방문 전에 무엇을 확인해야 하나요?', content: '문화누리카드는 공식 가맹점 여부, 산림복지서비스이용권은 등록 산림복지시설 여부, 자격형 감면은 시설별 대상·증빙·동반인 기준을 확인하세요. 운영시간, 휴무일, 예약과 현장 결제 가능 여부도 함께 확인하는 것이 좋습니다.' },
];

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button onClick={() => setOpen(value => !value)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-gray-800" style={{ fontSize: '0.88rem', fontWeight: 700 }}>{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-gray-500" style={{ fontSize: '0.78rem', lineHeight: 1.7 }}>{content}</p>}
    </div>
  );
}

export function GuideScreen({ onBack }: GuideScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} aria-label="뒤로" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-700" /></button>
        <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>여행복지 안내</p>
      </header>
      <main className="flex-1 overflow-y-auto px-5 py-5">
        <section className="bg-green-700 rounded-2xl p-5 text-white mb-5">
          <p className="text-green-200" style={{ fontSize: '0.72rem', fontWeight: 700 }}>TripAble GUIDE</p>
          <h1 className="text-white mt-2" style={{ fontSize: '1.25rem', fontWeight: 800 }}>내 조건에 맞는 여행복지 찾기</h1>
          <p className="text-green-100 mt-2" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>실제 제도와 시설별 확인이 필요한 항목을 구분해 여행 준비에 필요한 정보를 정리합니다.</p>
        </section>
        <section className="bg-white rounded-2xl px-4 mb-4">{GUIDE_SECTIONS.map(section => <AccordionItem key={section.title} {...section} />)}</section>
        <section className="bg-white rounded-2xl p-4 mb-4">
          <h2 className="text-gray-800" style={{ fontWeight: 800, fontSize: '0.9rem' }}>현재 연결된 제도</h2>
          <div className="mt-3 space-y-3">
            {BENEFIT_CATALOG.map(benefit => (
              <div key={benefit.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2"><p className="text-gray-800" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{benefit.name}</p><span className="text-gray-400" style={{ fontSize: '0.68rem' }}>{BENEFIT_CATEGORY_LABELS[benefit.category]}</span></div>
                <p className="text-gray-500 mt-1" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>{benefit.amountLabel}</p>
                <a href={benefit.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-700 mt-2" style={{ fontSize: '0.7rem', fontWeight: 700 }}>공식 안내 <ExternalLink className="w-3 h-3" /></a>
              </div>
            ))}
          </div>
        </section>
        <p className="text-gray-400 px-1 pb-5" style={{ fontSize: '0.7rem', lineHeight: 1.6 }}>제도 조건과 금액은 공고·운영기관·시설 정책에 따라 달라질 수 있습니다. TripAble의 결과는 탐색을 돕기 위한 참고 정보입니다.</p>
      </main>
    </div>
  );
}
