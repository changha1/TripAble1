import { ITourService, TourAPIResponse } from './tour.interface.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

export class TourRealService implements ITourService {
  private getApiKey(): string {
    const key = process.env.TOUR_API_KEY;
    if (!key) {
      throw new Error('TOUR_API_KEY is not defined in environment variables');
    }
    return key;
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string | number | undefined>): Promise<TourAPIResponse> {
    const apiKey = this.getApiKey();
    const url = new URL(`${BASE_URL}/${endpoint}`);
    
    // 필수 공통 파라미터 추가
    url.searchParams.append('serviceKey', apiKey);
    url.searchParams.append('MobileOS', 'WEB');
    url.searchParams.append('MobileApp', 'TripAble');
    url.searchParams.append('_type', 'json');

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, val.toString());
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TourAPI HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as TourAPIResponse;

      // API 에러 응답 검증 (3.8 에러 핸들링 참고)
      const header = data?.response?.header;
      if (!header) {
        throw new Error('Invalid response structure from TourAPI');
      }

      if (header.resultCode !== '0000' && header.resultCode !== '0001') { // 0001은 데이터 없음의 뜻일 수 있음
        throw new Error(`TourAPI Error: [${header.resultCode}] ${header.resultMsg}`);
      }

      return data;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`TourAPI Request Failed: ${url.toString()} | Error: ${errMsg}`);
      throw err;
    }
  }

  async areaBasedList(params: {
    areaCode?: string;
    sigunguCode?: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    return this.fetchFromApi('areaBasedList2', {
      areaCode: params.areaCode,
      sigunguCode: params.sigunguCode,
      contentTypeId: params.contentTypeId,
      pageNo: params.pageNo || 1,
      numOfRows: params.numOfRows || 10,
      arrange: 'Q' // Q: 수정일 순, A: 제목순
    });
  }

  async locationBasedList(params: {
    mapX: number;
    mapY: number;
    radius: number;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    return this.fetchFromApi('locationBasedList2', {
      mapX: params.mapX,
      mapY: params.mapY,
      radius: Math.min(20000, params.radius),
      contentTypeId: params.contentTypeId,
      pageNo: params.pageNo || 1,
      numOfRows: params.numOfRows || 10,
      arrange: 'E' // E: 거리순
    });
  }

  async searchKeyword(params: {
    keyword: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    // searchKeyword2는 한글 키워드에 대해 인코딩이 필요함 (fetch가 알아서 해줌)
    return this.fetchFromApi('searchKeyword2', {
      keyword: params.keyword,
      contentTypeId: params.contentTypeId,
      pageNo: params.pageNo || 1,
      numOfRows: params.numOfRows || 10,
      arrange: 'Q'
    });
  }

  async searchFestival(params: {
    eventStartDate: string;
    eventEndDate?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    return this.fetchFromApi('searchFestival2', {
      eventStartDate: params.eventStartDate,
      eventEndDate: params.eventEndDate || params.eventStartDate,
      pageNo: params.pageNo || 1,
      numOfRows: params.numOfRows || 10,
      arrange: 'Q'
    });
  }

  async searchStay(params: {
    areaCode?: string;
    sigunguCode?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse> {
    return this.fetchFromApi('searchStay2', {
      areaCode: params.areaCode,
      sigunguCode: params.sigunguCode,
      pageNo: params.pageNo || 1,
      numOfRows: params.numOfRows || 10,
      arrange: 'Q'
    });
  }

  async detailCommon(contentId: string): Promise<TourAPIResponse> {
    return this.fetchFromApi('detailCommon2', {
      contentId,
      defaultYN: 'Y',
      firstImageYN: 'Y',
      addrinfoYN: 'Y',
      mapinfoYN: 'Y',
      overviewYN: 'Y',
      cpyrhtDivCdYN: 'Y'
    });
  }

  async detailIntro(contentId: string, contentTypeId: string): Promise<TourAPIResponse> {
    return this.fetchFromApi('detailIntro2', {
      contentId,
      contentTypeId
    });
  }

  async detailInfo(contentId: string, contentTypeId: string): Promise<TourAPIResponse> {
    return this.fetchFromApi('detailInfo2', {
      contentId,
      contentTypeId
    });
  }

  async detailImage(contentId: string): Promise<TourAPIResponse> {
    return this.fetchFromApi('detailImage2', {
      contentId,
      imageYN: 'Y',
      subImageYN: 'Y'
    });
  }
}
