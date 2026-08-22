import { useState } from 'react';
import {
  ChevronLeft, Heart, Share2, Star, MapPin, Phone, Clock,
  CheckCircle2, AlertCircle, HelpCircle, XCircle,
  Accessibility, Car, Baby, Users, Coffee, Layers
} from 'lucide-react';
import type { Place } from './types';
import { voucherStatusConfig, type VoucherStatus } from './types';
import { findBenefit } from '../data/benefits';

interface PlaceDetailScreenProps {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCreatePlan: () => void;
  onBack: () => void;
}

const STATUS_ICONS: Record<VoucherStatus, React.ReactNode> = {
  available: <CheckCircle2 className="w-5 h-5" />,
  conditional: <AlertCircle className="w-5 h-5" />,
  check: <HelpCircle className="w-5 h-5" />,
  unavailable: <XCircle className="w-5 h-5" />,
};

const STATUS_LABELS: Record<VoucherStatus, string> = {
  available: '바우처 이용 가능',
  conditional: '조건부 이용 가능',
  check: '이용 가능 여부 확인 필요',
  unavailable: '바우처 이용 불가',
};

function AccessibilityItem({ icon, label, available }: { icon: React.ReactNode; label: string; available: boolean | null }) {
  const confirmed = available === true;
  const unknown = available === null;
  return (
    <div className={`rounded-xl p-3 flex items-center gap-2 ${confirmed ? 'bg-blue-50' : unknown ? 'bg-amber-50' : 'bg-gray-50'}`}>
      <div className={`${confirmed ? 'text-blue-500' : unknown ? 'text-amber-500' : 'text-gray-300'}`}>{icon}</div>
      <div>
        <p className={`${confirmed ? 'text-blue-700' : unknown ? 'text-amber-700' : 'text-gray-400'}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {label}
        </p>
        <p className={`${confirmed ? 'text-blue-500' : unknown ? 'text-amber-600' : 'text-gray-400'}`} style={{ fontSize: '0.68rem' }}>
          {confirmed ? '확인됨' : unknown ? '확인 필요' : '없음'}
        </p>
      </div>
    </div>
  );
}

export function PlaceDetailScreen({
  place,
  isFavorite,
  onToggleFavorite,
  onCreatePlan,
  onBack,
}: PlaceDetailScreenProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const statusCfg = voucherStatusConfig[place.voucherStatus];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        {/* Hero image */}
        <div className="relative h-64">
          <img
            src={place.image}
            alt={place.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

          {/* Overlay buttons */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleFavorite}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
              <button className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute bottom-3 left-4">
            <span className="bg-white/90 text-gray-700 rounded-full px-3 py-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {place.type}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Name & basic info */}
          <div>
            <h1 className="text-gray-900 mb-1" style={{ fontWeight: 800, fontSize: '1.4rem' }}>{place.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{place.rating}</span>
                <span className="text-gray-400" style={{ fontSize: '0.8rem' }}>({place.reviewCount.toLocaleString()}개 리뷰)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span style={{ fontSize: '0.8rem' }}>{place.region} {place.city}</span>
              </div>
            </div>
          </div>

          {/* Voucher status — prominent */}
          <div className={`rounded-2xl p-4 border-2 ${statusCfg.bgColor} ${statusCfg.borderColor}`}>
            <div className={`flex items-center gap-2 mb-2 ${statusCfg.textColor}`}>
              {STATUS_ICONS[place.voucherStatus]}
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{STATUS_LABELS[place.voucherStatus]}</span>
            </div>
            <p className={statusCfg.textColor} style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
              {place.voucherStatusDetail}
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>사용할 수 있는 여행복지</p>
            <div className="space-y-2">
              {(place.benefitApplications || []).map(application => (
                <div key={application.benefitId} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${application.status === 'available' ? 'bg-green-500' : application.status === 'check' ? 'bg-amber-500' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <p className="text-gray-700" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{findBenefit(application.benefitId)?.name || application.benefitId}</p>
                    <p className="text-gray-500" style={{ fontSize: '0.72rem', lineHeight: 1.5 }}>{application.detail}</p>
                  </div>
                </div>
              ))}
              {(!place.benefitApplications || place.benefitApplications.length === 0) && <p className="text-gray-500" style={{ fontSize: '0.75rem' }}>이 장소의 혜택별 상세 정보는 확인이 필요합니다.</p>}
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>예상 이용 금액</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>정상 이용요금</span>
                <span className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  {place.entryFee === 0 ? '무료' : `${place.entryFee.toLocaleString()}원`}
                </span>
              </div>
              {(place.priceBreakdown?.discountAmount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>자격형 할인</span>
                  <span className="text-purple-600" style={{ fontWeight: 700, fontSize: '0.88rem' }}>-{(place.priceBreakdown?.discountAmount || 0).toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500" style={{ fontSize: '0.85rem' }}>바우처 사용 예상액</span>
                <span className="text-green-600" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  -{(place.entryFee - place.selfPay).toLocaleString()}원
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.88rem' }}>예상 본인부담금</span>
                <span className={`${place.selfPay === 0 ? 'text-green-600' : 'text-gray-900'}`}
                  style={{ fontWeight: 800, fontSize: '1rem' }}>
                  {place.selfPay === 0 ? '없음 (0원)' : `${place.selfPay.toLocaleString()}원`}
                </span>
              </div>
            </div>
          </div>

          {/* Operating hours */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
            <p className="text-gray-700" style={{ fontWeight: 700, fontSize: '0.9rem' }}>운영 정보</p>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-none" />
              <div>
                <p className="text-gray-600" style={{ fontSize: '0.82rem', fontWeight: 600 }}>운영시간</p>
                <p className="text-gray-500" style={{ fontSize: '0.8rem' }}>{place.operatingHours}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-none" />
              <div>
                <p className="text-gray-600" style={{ fontSize: '0.82rem', fontWeight: 600 }}>휴무일</p>
                <p className="text-gray-500" style={{ fontSize: '0.8rem' }}>{place.closedDays}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-none" />
              <div>
                <p className="text-gray-600" style={{ fontSize: '0.82rem', fontWeight: 600 }}>주소</p>
                <p className="text-gray-500" style={{ fontSize: '0.8rem' }}>{place.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-none" />
              <div>
                <p className="text-gray-600" style={{ fontSize: '0.82rem', fontWeight: 600 }}>전화번호</p>
                <a href={`tel:${place.phone}`} className="text-green-600" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {place.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-none" />
              <div>
                <p className="text-gray-600" style={{ fontSize: '0.82rem', fontWeight: 600 }}>교통편</p>
                <p className="text-gray-500" style={{ fontSize: '0.8rem' }}>{place.transportOptions.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700 mb-2" style={{ fontWeight: 700, fontSize: '0.9rem' }}>장소 소개</p>
            <p className="text-gray-600" style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{place.description}</p>
          </div>

          {/* Highlights */}
          {place.highlights.length > 0 && (
            <div>
              <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                <Layers className="w-4 h-4 inline mr-1.5 text-gray-400" />
                주요 볼거리
              </p>
              <div className="space-y-2">
                {place.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-none">
                      <span className="text-white" style={{ fontSize: '0.65rem', fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <p className="text-gray-700" style={{ fontSize: '0.82rem' }}>{h}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility */}
          <div>
            <p className="text-gray-700 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              <Accessibility className="w-4 h-4 inline mr-1.5 text-gray-400" />
              편의시설 정보
            </p>
            <div className="grid grid-cols-2 gap-2">
              <AccessibilityItem icon={<span style={{ fontSize: '1rem' }}>♿</span>} label="휠체어 접근 가능" available={place.accessibility.wheelchair} />
              <AccessibilityItem icon={<span style={{ fontSize: '1rem' }}>🚻</span>} label="장애인 화장실" available={place.accessibility.disabledToilet} />
              <AccessibilityItem icon={<span style={{ fontSize: '1rem' }}>🅿️</span>} label="장애인 주차구역" available={place.accessibility.disabledParking} />
              <AccessibilityItem icon={<span style={{ fontSize: '1rem' }}>🛗</span>} label="엘리베이터" available={place.accessibility.elevator} />
              <AccessibilityItem icon={<Baby className="w-4 h-4" />} label="유아 동반 편의시설" available={place.accessibility.babyFacility} />
              <AccessibilityItem icon={<Users className="w-4 h-4" />} label="고령자 이용 편의" available={place.accessibility.seniorFriendly} />
              <AccessibilityItem icon={<Coffee className="w-4 h-4" />} label="휴식 공간" available={place.accessibility.restArea} />
            </div>
          </div>

          {/* Recommend reason */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-green-700 mb-2" style={{ fontWeight: 700, fontSize: '0.85rem' }}>✨ 추천 이유</p>
            <p className="text-green-600" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>{place.recommendReason}</p>
          </div>

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 mb-1" style={{ fontWeight: 700, fontSize: '0.82rem' }}>⚠️ 방문 전 확인사항</p>
            <ul className="text-amber-600 space-y-1" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
              <li>• 바우처 이용 가능 여부는 현장 상황에 따라 달라질 수 있습니다.</li>
              <li>• 방문 전 해당 시설에 전화하여 확인하시기 바랍니다.</li>
              <li>• 관광 정보 최종 수정일: {place.lastUpdated}</li>
            </ul>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* Bottom action */}
      <div className="bg-white border-t border-gray-100 px-5 py-4">
        <div className="flex gap-3">
          <button
            onClick={onToggleFavorite}
            className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center flex-none transition-all ${
              isFavorite ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
          </button>
          <button
            onClick={onCreatePlan}
            className="flex-1 bg-green-600 text-white rounded-xl py-3.5 active:scale-95 transition-transform"
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            여행 계획에 추가
          </button>
        </div>
      </div>
    </div>
  );
}
