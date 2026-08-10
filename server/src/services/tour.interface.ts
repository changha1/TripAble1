// TourAPI 응답을 위한 공통 타입 정의
export interface TourHeader {
  resultCode: string;
  resultMsg: string;
}

export interface TourItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1: string;
  addr2?: string;
  zipcode?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  cpyrhtDivCd?: string; // 저작권 유형: Type1 (출처표시), Type3 (출처표시 + 변경금지)
  mapx: string;
  mapy: string;
  dist?: string; // 위치기반 조회 시 반경 거리 (m 단위 문자열)
  modifiedtime?: string; // YYYYMMDDHHMMSS 형태
  mlevel?: string;
  areacode?: string;
  sigungucode?: string;
  // 카테고리 정보
  cat1?: string; // lclsSystm1
  cat2?: string; // lclsSystm2
  cat3?: string; // lclsSystm3
  
  // detailIntro2 필드들 (콘텐츠 타입별 상이)
  usetime?: string; // 이용시간 (관광지 등)
  usefee?: string; // 이용요금 (관광지 등)
  parking?: string; // 주차여부 (관광지 등)
  infocenter?: string; // 문의처
  parkinglodging?: string; // 숙박 주차 (숙박)
  reservationlodging?: string; // 숙박 예약안내 (숙박)
  checkintime?: string; // 입실시간 (숙박)
  checkouttime?: string; // 퇴실시간 (숙박)
  
  // detailInfo2 필드들 (반복 정보)
  roomtitle?: string;
  roomsize?: string;
  roomcount?: string;
  
  // detailImage2 필드들
  originimgurl?: string;
  smallimageurl?: string;
}

export interface TourBody {
  items: {
    item: TourItem[];
  } | string; // 데이터가 없을 경우 빈 문자열 "" 이 오기도 함
  numOfRows: number;
  pageNo: number;
  totalCount: number;
}

export interface TourAPIResponse {
  response: {
    header: TourHeader;
    body?: TourBody;
  }
}

export interface ITourService {
  areaBasedList(params: {
    areaCode?: string;
    sigunguCode?: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse>;

  locationBasedList(params: {
    mapX: number;
    mapY: number;
    radius: number; // max 20000
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse>;

  searchKeyword(params: {
    keyword: string;
    contentTypeId?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse>;

  searchFestival(params: {
    eventStartDate: string; // YYYYMMDD
    eventEndDate?: string;   // YYYYMMDD
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse>;

  searchStay(params: {
    areaCode?: string;
    sigunguCode?: string;
    pageNo?: number;
    numOfRows?: number;
  }): Promise<TourAPIResponse>;

  detailCommon(contentId: string): Promise<TourAPIResponse>;
  
  detailIntro(contentId: string, contentTypeId: string): Promise<TourAPIResponse>;

  detailInfo(contentId: string, contentTypeId: string): Promise<TourAPIResponse>;

  detailImage(contentId: string): Promise<TourAPIResponse>;
}
