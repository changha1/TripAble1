import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './db/prisma.js';
import { TourServiceFactory } from './services/tour.factory.js';
import { VoucherMatcher } from './services/voucher.matcher.js';
import { RecommendScorer } from './services/recommend.scorer.js';
import { CacheService } from './services/cache.service.js';
import { AIParser } from './services/ai.parser.js';
import { TripInput, VoucherStatus, Place } from './types/index.js';
import { TourItem } from './services/tour.interface.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const REGION_CODES: Record<string, string> = {
  '서울': '1', '인천': '2', '대전': '3', '대구': '4', '광주': '5', '부산': '6', '울산': '7', '세종': '8',
  '경기': '31', '강원': '32', '충북': '33', '충남': '34', '전북': '37', '전남': '38', '경북': '35', '경남': '36', '제주': '39'
};

// 바우처 매칭 모듈 생성
const voucherMatcher = new VoucherMatcher();

// 3.1 & 3.2 통합 검색 파이프라인
app.post('/api/search', async (req, res, next) => {
  try {
    const input = req.body as TripInput;
    if (!input.voucher) {
      return res.status(400).json({ error: '보보유 바우처 정보는 필수입니다.' });
    }

    const cacheKey = CacheService.generateKey(input);
    const cachedResult = CacheService.get<Place[]>(cacheKey);
    if (cachedResult) {
      console.log('⚡ Cache Hit for search query');
      return res.json({ results: cachedResult });
    }

    const tourService = TourServiceFactory.getService();
    const areaCode = input.region ? REGION_CODES[input.region] : undefined;

    let rawResponse;

    // 대중교통/자가용 등 조건에 따라 위치기반 조회 분기
    // 예시: 가까운 장소 우선(nearby) 선택 시 및 서울 중심 좌표 기준
    const isNearby = input.transportation.includes('nearby');
    if (isNearby) {
      // 서울 종로 기준 좌표로 가상의 거리 계산 지원 (목업 혹은 실제)
      rawResponse = await tourService.locationBasedList({
        mapX: 126.9768955, // 경복궁 기준 X
        mapY: 37.5776087,  // 경복궁 기준 Y
        radius: 20000,     // 20km
        pageNo: 1,
        numOfRows: 30
      });
    } else if (input.tourismTypes.includes('performance')) {
      // 행사/페스티벌의 경우 별도 검색
      rawResponse = await tourService.searchFestival({
        eventStartDate: input.startDate ? input.startDate.replace(/-/g, '') : new Date().toISOString().split('T')[0].replace(/-/g, ''),
        pageNo: 1,
        numOfRows: 30
      });
    } else if (input.tourismTypes.includes('rest') && !areaCode) {
      // 숙박 위주의 경우
      rawResponse = await tourService.searchStay({
        pageNo: 1,
        numOfRows: 30
      });
    } else {
      // 일반 지역 기반 조회
      rawResponse = await tourService.areaBasedList({
        areaCode,
        pageNo: 1,
        numOfRows: 50
      });
    }

    const itemsRaw = rawResponse.response?.body?.items;
    let rawItems: TourItem[] = [];
    if (itemsRaw && typeof itemsRaw === 'object' && Array.isArray(itemsRaw.item)) {
      rawItems = itemsRaw.item;
    }

    // 1단계: 필수 필터링
    const matchFn = (item: TourItem) => voucherMatcher.match(item, input.voucher!.id);
    const filtered = RecommendScorer.filterItems(rawItems, input, matchFn);

    // 2단계 & 3단계: 추천 점수 계산 및 추천 사유 생성 및 정렬
    const scoredPlaces = RecommendScorer.scoreAndNormalize(filtered, input);

    // 3.8 결과가 0건일 때 대체 옵션 힌트 생성
    if (scoredPlaces.length === 0) {
      const suggestions = [];
      if (input.region) {
        suggestions.push(`인접 지역인 '경기' 또는 '인천'을 탐색해 보세요.`);
      }
      if (input.selfPayBudget < 30000) {
        suggestions.push(`본인부담 예산을 조금 더 늘려보시면 더 많은 장소가 표시됩니다.`);
      }
      if (input.accessibility.length > 0) {
        suggestions.push(`필수 편의조건 개수를 일부 줄여서 찾아보세요.`);
      }

      return res.json({
        results: [],
        suggestions,
        message: '현재 조건과 일치하는 장소를 찾지 못했습니다.'
      });
    }

    // 캐시에 결과 저장
    CacheService.set(cacheKey, scoredPlaces);

    return res.json({ results: scoredPlaces });
  } catch (err) {
    next(err);
  }
});

// 3.1 상세 정보 조회 (목록 단계에서 호출 방지, 상세 클릭 시 개별 호출)
app.get('/api/places/:id/detail', async (req, res, next) => {
  try {
    const { id } = req.params;
    const tourService = TourServiceFactory.getService();

    // 4가지 상세 API 동시 조회
    const [commonRes, introRes, infoRes, imageRes] = await Promise.all([
      tourService.detailCommon(id),
      tourService.detailIntro(id, '12'), // contentTypeId가 보통 12, 14, 32 등
      tourService.detailInfo(id, '12'),
      tourService.detailImage(id)
    ]);

    const commonItem = commonRes.response?.body?.items;
    let detailItem: any = {};

    if (commonItem && typeof commonItem === 'object' && Array.isArray(commonItem.item) && commonItem.item.length > 0) {
      detailItem = commonItem.item[0];
    } else {
      return res.status(404).json({ error: '해당 장소의 정보를 찾을 수 없습니다.' });
    }

    // 소개정보 결합
    const introItems = introRes.response?.body?.items;
    if (introItems && typeof introItems === 'object' && Array.isArray(introItems.item) && introItems.item.length > 0) {
      detailItem = { ...detailItem, ...introItems.item[0] };
    }

    // 이미지 결합
    const imageItems = imageRes.response?.body?.items;
    const additionalImages: string[] = [];
    if (imageItems && typeof imageItems === 'object' && Array.isArray(imageItems.item)) {
      imageItems.item.forEach((img: any) => {
        if (img.originimgurl) additionalImages.push(img.originimgurl);
      });
    }

    // 반복정보 결합
    const infoItems = infoRes.response?.body?.items;
    const subDetails: string[] = [];
    if (infoItems && typeof infoItems === 'object' && Array.isArray(infoItems.item)) {
      infoItems.item.forEach((info: any) => {
        if (info.roomtitle) {
          subDetails.push(`${info.roomtitle} (${info.roomsize || '크기 미기재'})`);
        }
      });
    }

    return res.json({
      detail: detailItem,
      images: additionalImages,
      subDetails
    });
  } catch (err) {
    next(err);
  }
});

// 3.6 자연어 조건 변환 (AI 연동)
app.post('/api/search/natural-language', async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: '자연어 질의(prompt)는 필수입니다.' });
    }

    const structuredConditions = await AIParser.parsePrompt(prompt);
    return res.json({ conditions: structuredConditions });
  } catch (err) {
    next(err);
  }
});

// 3.7 사용자 관심장소 토글 및 조회
app.post('/api/favorites', async (req, res, next) => {
  try {
    const { userId, placeId } = req.body;
    if (!userId || !placeId) {
      return res.status(400).json({ error: 'userId와 placeId는 필수입니다.' });
    }

    // 존재 여부 파악 후 토글
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_placeId: { userId, placeId }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_placeId: { userId, placeId }
        }
      });
      return res.json({ status: 'removed', placeId });
    } else {
      await prisma.favorite.create({
        data: { userId, placeId }
      });
      return res.json({ status: 'added', placeId });
    }
  } catch (err) {
    next(err);
  }
});

app.get('/api/favorites', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId는 필수 쿼리 스트링입니다.' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ favorites });
  } catch (err) {
    next(err);
  }
});

// 3.7 여행 계획 저장 및 목록 조회
app.post('/api/trips', async (req, res, next) => {
  try {
    const {
      userId,
      title,
      travelDate,
      duration,
      places, // Array of { placeId, visitOrder, entryFee, selfPay }
      totalVoucherAmount,
      totalSelfPay,
      remainingBalance
    } = req.body;

    if (!userId || !title || !places || !Array.isArray(places)) {
      return res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' });
    }

    const plan = await prisma.tripPlan.create({
      data: {
        userId,
        title,
        travelDate,
        duration,
        totalVoucherAmount,
        totalSelfPay,
        remainingBalance,
        places: {
          create: places.map((p: any) => ({
            placeId: p.placeId,
            visitOrder: p.visitOrder,
            entryFee: p.entryFee,
            selfPay: p.selfPay
          }))
        }
      },
      include: {
        places: true
      }
    });

    return res.json({ status: 'success', plan });
  } catch (err) {
    next(err);
  }
});

app.get('/api/trips', async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId는 필수 쿼리 스트링입니다.' });
    }

    const plans = await prisma.tripPlan.findMany({
      where: { userId },
      include: {
        places: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ plans });
  } catch (err) {
    next(err);
  }
});

// 3.7 공유 단건 조회 API
app.get('/api/trips/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const plan = await prisma.tripPlan.findUnique({
      where: { id },
      include: {
        places: true
      }
    });

    if (!plan) {
      return res.status(404).json({ error: '여행 계획을 찾을 수 없습니다.' });
    }

    return res.json({ plan });
  } catch (err) {
    next(err);
  }
});

// 3.7 간이 로그인 API
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: '이메일 주소는 필수입니다.' });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email }
    });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

// 에러 핸들링 미들웨어 (3.8)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Internal Error:', err);
  const status = err.status || 500;
  return res.status(status).json({
    error: '서버와 연결을 실패했거나 요청을 처리하는 도중 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TripAble Backend Server running on http://localhost:${PORT}`);
});
