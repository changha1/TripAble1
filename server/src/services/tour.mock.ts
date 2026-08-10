import { ITourService, TourAPIResponse, TourItem } from './tour.interface.js';

// 실제 한국관광공사 OpenAPI 응답 형태를 정밀하게 모사하기 위한 목업 데이터셋
const MOCK_RAW_ITEMS: TourItem[] = [
  {
    contentid: '1',
    contenttypeid: '12', // 관광지
    title: '경복궁',
    addr1: '서울특별시 종로구 사직로 161',
    zipcode: '03045',
    tel: '02-3700-3900',
    firstimage: 'https://images.unsplash.com/photo-1599033769063-fcd3ef816810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    firstimage2: 'https://images.unsplash.com/photo-1599033769063-fcd3ef816810?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    cpyrhtDivCd: 'Type1', // 저작권 Type1: 출처표시
    mapx: '126.9768955',
    mapy: '37.5776087',
    modifiedtime: '20260615120000',
    areacode: '1', // 서울
    sigungucode: '1', // 종로구
    cat1: 'A02', cat2: 'A0201', cat3: 'A02010100', // 역사/문화재
    usetime: '09:00 ~ 18:00 (입장마감 17:00)',
    usefee: '어른 3,000원, 청소년 이하 무료 (한복 착용자 무료)',
    parking: '장애인 주차구역 있음, 유료 주차장 이용 가능'
  },
  {
    contentid: '2',
    contenttypeid: '14', // 문화시설
    title: '국립중앙박물관',
    addr1: '서울특별시 용산구 서빙고로 137',
    zipcode: '04383',
    tel: '02-2077-9000',
    firstimage: 'https://images.unsplash.com/photo-1529883406927-e996c9ae3353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    firstimage2: 'https://images.unsplash.com/photo-1529883406927-e996c9ae3353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    cpyrhtDivCd: 'Type1',
    mapx: '126.9801456',
    mapy: '37.5240356',
    modifiedtime: '20260701103000',
    areacode: '1', // 서울
    sigungucode: '21', // 용산구
    cat1: 'A02', cat2: 'A0206', cat3: 'A02060100', // 박물관
    usetime: '10:00 ~ 18:00 (수, 토요일은 21:00까지)',
    usefee: '상설전시관 무료, 기획/특별전시 유료 (문화누리카드 결제 가능)',
    parking: '장애인 주차 무료, 일반 차량 유료'
  },
  {
    contentid: '3',
    contenttypeid: '12', // 관광지 (경기 용인)
    title: '한국민속촌',
    addr1: '경기도 용인시 기흥구 민속촌로 90',
    zipcode: '17075',
    tel: '031-288-0000',
    firstimage: 'https://images.unsplash.com/photo-1703825864792-5880081beaaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type3', // 저작권 Type3: 출처표시+변경금지
    mapx: '127.1203498',
    mapy: '37.2588321',
    modifiedtime: '20260520140000',
    areacode: '31', // 경기
    sigungucode: '22', // 용인시
    cat1: 'A02', cat2: 'A0202', cat3: 'A02020700', // 전통민속
    usetime: '09:30 ~ 18:00',
    usefee: '성인 35,000원, 청소년 30,000원, 아동 25,000원 (온라인 문화누리카드 할인 가능)',
    parking: '대형 주차장 구비, 유료 주차'
  },
  {
    contentid: '4',
    contenttypeid: '12', // 관광지 (제주 서귀포)
    title: '천지연 폭포',
    addr1: '제주특별자치도 서귀포시 천지동 667-7',
    zipcode: '63595',
    tel: '064-760-6304',
    firstimage: 'https://images.unsplash.com/photo-1628411848698-e3b3249a272a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '126.5594411',
    mapy: '33.2458422',
    modifiedtime: '20251110090000',
    areacode: '39', // 제주
    sigungucode: '3', // 서귀포시
    cat1: 'A01', cat2: 'A0101', cat3: 'A01011500', // 자연폭포
    usetime: '09:00 ~ 22:00 (입장마감 21:20)',
    usefee: '어른 2,000원, 어린이/청소년 1,000원',
    parking: '주차 요금 무료, 장애인 전용 구역 구비'
  },
  {
    contentid: '5',
    contenttypeid: '12', // 관광지 (부산 해운대)
    title: '부산 해운대해수욕장',
    addr1: '부산광역시 해운대구 해운대해변로 264',
    zipcode: '48093',
    tel: '051-749-7601',
    firstimage: 'https://images.unsplash.com/photo-1556966346-0215efedf4d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '129.1585891',
    mapy: '35.1586975',
    modifiedtime: '20260710163000',
    areacode: '6', // 부산
    sigungucode: '9', // 해운대구
    cat1: 'A01', cat2: 'A0101', cat3: 'A01011200', // 해수욕장
    usetime: '24시간 개방',
    usefee: '무료 입장',
    parking: '공영주차장 이용 가능 (장애인 할인 가능)'
  },
  {
    contentid: '6',
    contenttypeid: '14', // 문화시설 (전북 전주)
    title: '전주 한옥마을 경기전',
    addr1: '전북특별자치도 전주시 완산구 태조로 44',
    zipcode: '55042',
    tel: '063-281-2790',
    firstimage: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '127.1498421',
    mapy: '35.8153421',
    modifiedtime: '20260628110000',
    areacode: '37', // 전북
    sigungucode: '1', // 전주시
    cat1: 'A02', cat2: 'A0201', cat3: 'A02010100', // 유적지
    usetime: '09:00 ~ 19:00 (동절기 18:00까지)',
    usefee: '어른 3,000원, 청소년 2,000원, 어린이 1,000원',
    parking: '한옥마을 공영주차장 이용'
  },
  {
    contentid: '7',
    contenttypeid: '15', // 행사/공연/축제 (서울)
    title: '서울 야간 창경궁 고궁음악회',
    addr1: '서울특별시 종로구 창경궁로 185',
    zipcode: '03072',
    tel: '02-762-4861',
    firstimage: 'https://images.unsplash.com/photo-1540998263728-032f59903a86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '126.9946800',
    mapy: '37.5794300',
    modifiedtime: '20260805150000',
    areacode: '1', // 서울
    sigungucode: '1', // 종로구
    cat1: 'A02', cat2: 'A0207', cat3: 'A02070100', // 페스티벌/음악회
    usetime: '19:30 ~ 21:00 (행사 기간 중)',
    usefee: '관람권 10,000원 (문화누리카드 가맹점)',
    parking: '창경궁 내 주차공간 협소, 대중교통 권장'
  },
  {
    contentid: '8',
    contenttypeid: '32', // 숙박 (서울)
    title: '서울 유스호스텔 더블룸',
    addr1: '서울특별시 중구 퇴계로26길 110',
    zipcode: '04626',
    tel: '02-319-1318',
    firstimage: 'https://images.unsplash.com/photo-1575391304128-f11964816ef6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '126.9904250',
    mapy: '37.5574510',
    modifiedtime: '20260705180000',
    areacode: '1', // 서울
    sigungucode: '2', // 중구
    cat1: 'B02', cat2: 'B0201', cat3: 'B02010700', // 유스호스텔
    checkintime: '15:00',
    checkouttime: '11:00',
    parkinglodging: '투숙객 무료 주차 가능 (장애인 주차면 보유)'
  },
  {
    contentid: '9',
    contenttypeid: '39', // 음식점 (서울)
    title: '종로 전통 한정식 도담',
    addr1: '서울특별시 종로구 삼청로 35',
    zipcode: '03062',
    tel: '02-733-1234',
    firstimage: 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '126.9802000',
    mapy: '37.5791000',
    modifiedtime: '20260712120000',
    areacode: '1',
    sigungucode: '1',
    cat1: 'A05', cat2: 'A0501', cat3: 'A05010100', // 한식
    usetime: '11:30 ~ 22:00 (브레이크타임 15:00 ~ 17:00)',
    usefee: '도담 한정식 코스 25,000원, 비빔밥 정식 12,000원',
    parking: '가게 앞 발렛주차 가능'
  },
  {
    contentid: '10',
    contenttypeid: '14', // 문화시설 (서울 종로)
    title: '국립현대미술관 서울관',
    addr1: '서울특별시 종로구 삼청로 30',
    zipcode: '03062',
    tel: '02-3701-9500',
    firstimage: 'https://images.unsplash.com/photo-1575391304128-f11964816ef6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    cpyrhtDivCd: 'Type1',
    mapx: '126.9790204',
    mapy: '37.5786884',
    modifiedtime: '20260705140000',
    areacode: '1', // 서울
    sigungucode: '1', // 종로구
    cat1: 'A02', cat2: 'A0206', cat3: 'A02060200', // 미술관
    usetime: '10:00 ~ 18:00 (수, 토 야간개장 ~21:00)',
    usefee: '통합관람권 4,000원 (대학생 및 만 24세 이하 무료, 문화누리카드 가능)',
    parking: '장애인 전용구역 보유, 유료 지하주차장 운영'
  }
];

// 좌표 사이의 거리를 계산하는 Haversine 공식 (미터 단위 반환)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class TourMockService implements ITourService {
  private makeResponse(items: TourItem[], pageNo = 1, numOfRows = 10): TourAPIResponse {
    const totalCount = items.length;
    const startIndex = (pageNo - 1) * numOfRows;
    const paginated = items.slice(startIndex, startIndex + numOfRows);

    return {
      response: {
        header: {
          resultCode: '0000',
          resultMsg: 'OK',
        },
        body: {
          items: paginated.length > 0 ? { item: paginated } : '',
          numOfRows,
          pageNo,
          totalCount,
        },
      },
    };
  }

  async areaBasedList(params: {
    areaCode?: string;
    sigunguCode?: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    let list = [...MOCK_RAW_ITEMS];
    if (params.areaCode) {
      list = list.filter(item => item.areacode === params.areaCode);
    }
    if (params.sigunguCode) {
      list = list.filter(item => item.sigungucode === params.sigunguCode);
    }
    if (params.contentTypeId) {
      list = list.filter(item => item.contenttypeid === params.contentTypeId);
    }
    return this.makeResponse(list, params.pageNo, params.numOfRows);
  }

  async locationBasedList(params: {
    mapX: number;
    mapY: number;
    radius: number;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    let list = [...MOCK_RAW_ITEMS];
    if (params.contentTypeId) {
      list = list.filter(item => item.contenttypeid === params.contentTypeId);
    }

    const matched = list
      .map(item => {
        const itemLat = parseFloat(item.mapy);
        const itemLon = parseFloat(item.mapx);
        const distMeters = calculateDistance(params.mapY, params.mapX, itemLat, itemLon);
        return {
          ...item,
          dist: Math.round(distMeters).toString(),
        };
      })
      .filter(item => {
        const dist = parseFloat(item.dist || '0');
        return dist <= params.radius;
      })
      .sort((a, b) => parseFloat(a.dist || '0') - parseFloat(b.dist || '0'));

    return this.makeResponse(matched, params.pageNo, params.numOfRows);
  }

  async searchKeyword(params: {
    keyword: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    let list = [...MOCK_RAW_ITEMS];
    if (params.contentTypeId) {
      list = list.filter(item => item.contenttypeid === params.contentTypeId);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase().trim();
      list = list.filter(item => item.title.toLowerCase().includes(kw) || item.addr1.toLowerCase().includes(kw));
    }
    return this.makeResponse(list, params.pageNo, params.numOfRows);
  }

  async searchFestival(params: {
    eventStartDate: string;
    eventEndDate?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    // 문화누리 목업에선 contentTypeId가 15인 것만 추출해서 반환
    const list = MOCK_RAW_ITEMS.filter(item => item.contenttypeid === '15');
    return this.makeResponse(list, params.pageNo, params.numOfRows);
  }

  async searchStay(params: {
    areaCode?: string;
    sigunguCode?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    let list = MOCK_RAW_ITEMS.filter(item => item.contenttypeid === '32');
    if (params.areaCode) {
      list = list.filter(item => item.areacode === params.areaCode);
    }
    if (params.sigunguCode) {
      list = list.filter(item => item.sigungucode === params.sigunguCode);
    }
    return this.makeResponse(list, params.pageNo, params.numOfRows);
  }

  async detailCommon(contentId: string): Promise<TourAPIResponse> {
    const matched = MOCK_RAW_ITEMS.find(item => item.contentid === contentId);
    return {
      response: {
        header: { resultCode: matched ? '0000' : '0001', resultMsg: matched ? 'OK' : 'No Data' },
        body: matched ? {
          items: { item: [matched] },
          numOfRows: 1,
          pageNo: 1,
          totalCount: 1,
        } : undefined,
      },
    };
  }

  async detailIntro(contentId: string, contentTypeId: string): Promise<TourAPIResponse> {
    const matched = MOCK_RAW_ITEMS.find(item => item.contentid === contentId && item.contenttypeid === contentTypeId);
    return {
      response: {
        header: { resultCode: matched ? '0000' : '0001', resultMsg: matched ? 'OK' : 'No Data' },
        body: matched ? {
          items: {
            item: [
              {
                contentid: matched.contentid,
                contenttypeid: matched.contenttypeid,
                usetime: matched.usetime || '정보없음',
                usefee: matched.usefee || '정보없음',
                parking: matched.parking || '정보없음',
                checkintime: matched.checkintime,
                checkouttime: matched.checkouttime,
                parkinglodging: matched.parkinglodging,
              } as TourItem,
            ],
          },
          numOfRows: 1,
          pageNo: 1,
          totalCount: 1,
        } : undefined,
      },
    };
  }

  async detailInfo(contentId: string, contentTypeId: string): Promise<TourAPIResponse> {
    // 반복 정보 - 코스 세부일정, 객실 목록 등
    const items: TourItem[] = [];
    if (contentId === '8') {
      items.push({
        contentid: '8',
        contenttypeid: '32',
        roomtitle: '스탠다드 더블 룸',
        roomsize: '22 sqm',
        roomcount: '5',
      } as TourItem);
    }
    return {
      response: {
        header: { resultCode: '0000', resultMsg: 'OK' },
        body: {
          items: items.length > 0 ? { item: items } : '',
          numOfRows: items.length,
          pageNo: 1,
          totalCount: items.length,
        },
      },
    };
  }

  async detailImage(contentId: string): Promise<TourAPIResponse> {
    // 추가 이미지 목록
    const images: TourItem[] = [];
    const matched = MOCK_RAW_ITEMS.find(item => item.contentid === contentId);
    if (matched && matched.firstimage) {
      images.push({
        contentid: contentId,
        contenttypeid: matched.contenttypeid,
        originimgurl: matched.firstimage,
        smallimageurl: matched.firstimage2 || matched.firstimage,
      } as TourItem);
    }
    return {
      response: {
        header: { resultCode: '0000', resultMsg: 'OK' },
        body: {
          items: images.length > 0 ? { item: images } : '',
          numOfRows: images.length,
          pageNo: 1,
          totalCount: images.length,
        },
      },
    };
  }
}
