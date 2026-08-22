import { useState } from 'react';
import { ChevronLeft, Share2, Download, Copy, Star, MapPin, Check, AlertTriangle, CreditCard } from 'lucide-react';
import type { TripPlan, Place } from './types';
import { voucherStatusConfig } from './types';
import { findBenefit } from '../data/benefits';

interface TripPlanScreenProps {
  plan: TripPlan;
  onSave: (plan: TripPlan) => void;
  onBack: () => void;
  onSelectPlace: (place: Place) => void;
}

function PlacePlanCard({ place, index, onClick }: { place: Place; index: number; onClick: () => void }) {
  const statusCfg = voucherStatusConfig[place.voucherStatus];
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Day indicator */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-none">
          <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{index + 1}</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-400" style={{ fontSize: '0.72rem' }}>
            {index === 0 ? '오전 첫 번째 장소' : index === 1 ? '오후 두 번째 장소' : '마지막 장소'}
          </p>
        </div>
        <span className="text-gray-400" style={{ fontSize: '0.72rem' }}>약 2~3시간</span>
      </div>

      <button onClick={onClick} className="flex w-full text-left">
        <img src={place.image} alt={place.name} className="w-24 h-24 object-cover flex-none" />
        <div className="p-3 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
              {place.type}
            </span>
          </div>
          <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{place.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-gray-600" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{place.rating}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bgColor} ${statusCfg.textColor}`}
              style={{ fontSize: '0.65rem' }}>
              {statusCfg.shortLabel}
            </span>
            <span className="text-gray-500" style={{ fontSize: '0.72rem' }}>
              {place.entryFee === 0 ? '무료' : `${place.entryFee.toLocaleString()}원`}
            </span>
          </div>
        </div>
      </button>

      {/* Cost row */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <div className="text-center">
          <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>입장료</p>
          <p className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {place.entryFee === 0 ? '무료' : `${place.entryFee.toLocaleString()}원`}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>혜택 차감</p>
          <p className="text-green-600" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            -{(place.entryFee - place.selfPay).toLocaleString()}원
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400" style={{ fontSize: '0.65rem' }}>본인부담</p>
          <p className={`${place.selfPay === 0 ? 'text-green-600' : 'text-gray-800'}`}
            style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {place.selfPay === 0 ? '없음' : `${place.selfPay.toLocaleString()}원`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TripPlanScreen({ plan, onSave, onBack, onSelectPlace }: TripPlanScreenProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    if (!saved) {
      onSave(plan);
      setSaved(true);
    }
  };

  const handleCopy = () => {
    const text = `[TripAble 여행 계획]\n${plan.title}\n날짜: ${plan.travelDate}\n\n장소:\n${plan.places.map((p, i) => `${i + 1}. ${p.name} (${p.region})`).join('\n')}\n\n총 바우처 사용: ${plan.totalVoucherAmount.toLocaleString()}원\n본인부담 합계: ${plan.totalSelfPay.toLocaleString()}원`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasCheckRequired = plan.places.some(p => p.voucherStatus === 'check' || p.voucherStatus === 'conditional');
  const hasUnavailable = plan.places.some(p => p.voucherStatus === 'unavailable');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.95rem' }}>여행 계획</p>
          <p className="text-gray-400" style={{ fontSize: '0.75rem' }}>
            {plan.travelDate} · {plan.duration === 'day' ? '당일치기' : '1박2일'}
          </p>
        </div>
        <button onClick={handleSave} className={`px-3 py-1.5 rounded-full border transition-all ${
          saved ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-100 border-transparent text-gray-600'
        }`} style={{ fontSize: '0.78rem', fontWeight: 600 }}>
          {saved ? '✓ 저장됨' : '저장'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Trip header */}
        <div className="bg-green-700 px-5 py-6 text-white">
          <h2 className="text-white mb-1" style={{ fontWeight: 800, fontSize: '1.2rem' }}>{plan.title}</h2>
          <p className="text-green-200" style={{ fontSize: '0.82rem' }}>
            📅 {plan.travelDate} · 📍 {plan.places[0]?.region || '전국'} · 🏛 장소 {plan.places.length}곳
          </p>

          {/* Cost overview */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-green-200" style={{ fontSize: '0.68rem' }}>금액형 혜택</p>
              <p className="text-white" style={{ fontWeight: 800, fontSize: '1rem' }}>
                {plan.totalVoucherAmount.toLocaleString()}원
              </p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-green-200" style={{ fontSize: '0.68rem' }}>본인부담 합계</p>
              <p className={`${plan.totalSelfPay === 0 ? 'text-green-300' : 'text-white'}`}
                style={{ fontWeight: 800, fontSize: '1rem' }}>
                {plan.totalSelfPay === 0 ? '없음' : `${plan.totalSelfPay.toLocaleString()}원`}
              </p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-green-200" style={{ fontSize: '0.68rem' }}>예상 잔액</p>
              <p className="text-white" style={{ fontWeight: 800, fontSize: '1rem' }}>
                {plan.remainingBalance >= 0 ? `${plan.remainingBalance.toLocaleString()}원` : '부족'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Alerts */}
          {hasCheckRequired && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-none mt-0.5" />
              <div>
                <p className="text-amber-800" style={{ fontWeight: 700, fontSize: '0.85rem' }}>확인이 필요한 항목이 있습니다</p>
                <p className="text-amber-600 mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                  일부 장소는 여행복지 이용 조건을 사전에 확인하셔야 합니다. 방문 전 해당 시설에 전화하시기 바랍니다.
                </p>
              </div>
            </div>
          )}

          {hasUnavailable && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-red-400 flex-none mt-0.5" />
              <div>
                <p className="text-red-700" style={{ fontWeight: 700, fontSize: '0.85rem' }}>여행복지 사용 불가 장소 포함</p>
                <p className="text-red-500 mt-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                  일부 장소는 현재 선택된 여행복지로 이용이 불가합니다. 해당 장소는 개인 비용으로 부담됩니다.
                </p>
              </div>
            </div>
          )}

          {/* Places */}
          <div>
            <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              방문 장소 순서
            </p>
            <div className="space-y-3">
              {plan.places.map((place, idx) => (
                <PlacePlanCard
                  key={place.id}
                  place={place}
                  index={idx}
                  onClick={() => onSelectPlace(place)}
                />
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>전체 비용 요약</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>총 입장료</span>
                <span className="text-gray-700" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {plan.places.reduce((s, p) => s + p.entryFee, 0).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>금액형 혜택 사용 예상액</span>
                <span className="text-green-600" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  -{plan.totalVoucherAmount.toLocaleString()}원
                </span>
              </div>
              {(plan.totalDiscountAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>자격형 할인 예상액</span>
                  <span className="text-green-600" style={{ fontWeight: 600, fontSize: '0.85rem' }}>-{(plan.totalDiscountAmount || 0).toLocaleString()}원</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>본인부담 합계</span>
                <span className={`${plan.totalSelfPay === 0 ? 'text-green-600' : 'text-gray-900'}`}
                  style={{ fontWeight: 800, fontSize: '1rem' }}>
                  {plan.totalSelfPay === 0 ? '0원' : `${plan.totalSelfPay.toLocaleString()}원`}
                </span>
              </div>
              <div className="flex justify-between bg-green-50 rounded-xl px-3 py-2">
                <span className="text-green-700" style={{ fontWeight: 600, fontSize: '0.85rem' }}>여행 후 예상 잔액</span>
                <span className="text-green-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  {plan.remainingBalance >= 0 ? `${plan.remainingBalance.toLocaleString()}원` : '잔액 부족'}
                </span>
              </div>
            </div>
            {plan.benefitSummary && plan.benefitSummary.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-gray-500 mb-2" style={{ fontSize: '0.75rem', fontWeight: 700 }}>혜택별 사용 내역</p>
                <div className="space-y-1.5">
                  {plan.benefitSummary.map(summary => (
                    <div key={summary.benefitId} className="flex justify-between text-gray-600" style={{ fontSize: '0.75rem' }}>
                      <span>{findBenefit(summary.benefitId)?.name || summary.benefitId}</span>
                      <span>{summary.usedAmount.toLocaleString()}원 사용</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="bg-white border-t border-gray-100 px-5 py-4 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ fontWeight: 600, fontSize: '0.85rem' }}
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '일정 복사'}
          </button>
          <button
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{ fontWeight: 600, fontSize: '0.85rem' }}
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
        </div>
        <button
          onClick={handleSave}
          className={`w-full rounded-xl py-3.5 flex items-center justify-center gap-2 active:scale-95 transition-transform ${
            saved ? 'bg-green-50 text-green-700 border-2 border-green-300' : 'bg-green-600 text-white'
          }`}
          style={{ fontWeight: 700, fontSize: '0.95rem' }}
        >
          {saved ? <><Check className="w-5 h-5" /> 저장 완료</> : <><Download className="w-5 h-5" /> 여행 계획 저장</>}
        </button>
      </div>
    </div>
  );
}
