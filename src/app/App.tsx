import { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { HomeScreen } from './components/HomeScreen';
import { TripFinderFlow } from './components/TripFinderFlow';
import { ResultsScreen } from './components/ResultsScreen';
import { PlaceDetailScreen } from './components/PlaceDetailScreen';
import { TripPlanScreen } from './components/TripPlanScreen';
import { SavedTripsScreen } from './components/SavedTripsScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { GuideScreen } from './components/GuideScreen';
import { BottomNav } from './components/BottomNav';
import { MOCK_PLACES, SAMPLE_SAVED_TRIPS } from './components/mockData';
import type { Screen, Place, TripInput, TripPlan } from './components/types';
import {
  loginUser,
  searchPlaces,
  getPlaceDetail,
  toggleFavoriteApi,
  getFavoritesApi,
  saveTripPlanApi,
  getTripPlansApi
} from './utils/api';

const DEFAULT_TRIP_INPUT: TripInput = {
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [tripInput, setTripInput] = useState<TripInput>(DEFAULT_TRIP_INPUT);
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>(SAMPLE_SAVED_TRIPS);
  const [favorites, setFavorites] = useState<Place[]>([]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // 로그인 성공 시 백엔드에서 사용자 저장 목록 로드
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginUser('gildong@example.com');
      setUserId(user.id);
      setIsLoggedIn(true);

      // 관심 장소 로드
      const favsData = await getFavoritesApi(user.id);
      const mappedFavs = favsData.map(f => {
        // MOCK_PLACES 또는 기본 템플릿으로 매핑
        const matched = MOCK_PLACES.find(p => p.id === f.placeId);
        return matched || {
          id: f.placeId,
          name: '불러온 장소',
          type: '관광지',
          types: [],
          region: '전국',
          city: '',
          address: '',
          phone: '',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
          rating: 4.0,
          reviewCount: 0,
          voucherStatus: 'available',
          voucherStatusDetail: '',
          entryFee: 0,
          selfPay: 0,
          accessibility: { wheelchair: false, disabledToilet: false, disabledParking: false, elevator: false, babyFacility: false, seniorFriendly: false, restArea: false },
          operatingHours: '',
          closedDays: '',
          description: '',
          highlights: [],
          lastUpdated: '',
          distance: 0,
          transportOptions: [],
          recommendReason: ''
        };
      });
      setFavorites(mappedFavs as Place[]);

      // 저장 일정 로드
      const plansData = await getTripPlansApi(user.id);
      const mappedPlans: TripPlan[] = plansData.map(plan => ({
        id: plan.id,
        title: plan.title,
        travelDate: plan.travelDate,
        duration: plan.duration,
        totalVoucherAmount: plan.totalVoucherAmount,
        totalSelfPay: plan.totalSelfPay,
        remainingBalance: plan.remainingBalance,
        places: plan.places.map((pp: any) => {
          const matched = MOCK_PLACES.find(p => p.id === pp.placeId);
          return matched || { id: pp.placeId, name: '장소 ' + pp.placeId, entryFee: pp.entryFee, selfPay: pp.selfPay };
        }),
        createdAt: plan.createdAt.split('T')[0]
      }));
      setSavedTrips(mappedPlans);
    } catch (e) {
      alert('로그인 처리 중 서버 통신 에러가 발생했습니다.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setFavorites([]);
    setSavedTrips(SAMPLE_SAVED_TRIPS);
  };

  const navigate = (to: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(to);
  };

  const goBack = () => {
    const history = [...screenHistory];
    const prev = history.pop() ?? 'home';
    setScreenHistory(history);
    setScreen(prev);
  };

  const handleSearch = async (input: TripInput) => {
    setTripInput(input);
    setIsLoading(true);
    setSuggestions([]);
    try {
      const data = await searchPlaces(input);
      setSearchResults(data.results);
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
      navigate('results');
    } catch (e) {
      alert('추천 검색 중 오류가 발생했습니다. 백엔드 상태를 확인해 주세요.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlace = async (place: Place) => {
    setIsLoading(true);
    try {
      // 3.2 상세 정보 클릭 시에만 단건 호출
      const details = await getPlaceDetail(place.id);
      
      setSelectedPlace({
        ...place,
        description: details.detail.overview || place.description,
        operatingHours: details.detail.usetime || place.operatingHours,
        closedDays: details.detail.closedDays || details.detail.restdate || place.closedDays,
        highlights: details.subDetails.length > 0 ? details.subDetails : place.highlights,
        transportOptions: details.detail.parking ? [`주차: ${details.detail.parking}`] : place.transportOptions,
        image: details.images[0] || place.image
      });
      navigate('place-detail');
    } catch (e) {
      console.warn('Failed to load full detail from server, using local fallback:', e);
      setSelectedPlace(place);
      navigate('place-detail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (place: Place) => {
    if (isLoggedIn && userId) {
      try {
        await toggleFavoriteApi(userId, place.id);
      } catch (e) {
        console.error('Failed to sync favorite with server:', e);
      }
    }
    
    setFavorites(prev => {
      const exists = prev.find(p => p.id === place.id);
      if (exists) return prev.filter(p => p.id !== place.id);
      return [...prev, place];
    });
  };

  const isFavorite = (placeId: string) => favorites.some(p => p.id === placeId);

  const handleCreateTripPlan = (places: Place[]) => {
    const voucherAmount = places.reduce((s, p) => s + (p.entryFee - p.selfPay), 0);
    const selfPayTotal = places.reduce((s, p) => s + p.selfPay, 0);
    const regionName = places[0]?.region || tripInput.region || '전국';
    const plan: TripPlan = {
      id: Date.now().toString(),
      title: `${regionName} ${tripInput.duration === 'day' ? '당일치기' : '1박2일'} 여행`,
      travelDate: tripInput.startDate || new Date().toISOString().split('T')[0],
      duration: tripInput.duration,
      places,
      totalVoucherAmount: Math.max(0, voucherAmount),
      totalSelfPay: selfPayTotal,
      remainingBalance: Math.max(0, (tripInput.balance || 0) - Math.max(0, voucherAmount)),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTripPlan(plan);
    navigate('trip-plan');
  };

  const handleSaveTripPlan = async (plan: TripPlan) => {
    if (isLoggedIn && userId) {
      try {
        await saveTripPlanApi(userId, plan);
      } catch (e) {
        alert('서버에 일정을 저장하지 못했습니다.');
        console.error(e);
      }
    }
    setSavedTrips(prev => {
      const exists = prev.find(t => t.id === plan.id);
      if (exists) return prev;
      return [plan, ...prev];
    });
  };

  const showBottomNav = !['start', 'trip-finder', 'place-detail', 'trip-plan', 'guide'].includes(screen);

  return (
    <div className="size-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      {/* App container — mobile phone silhouette on desktop */}
      <div
        className="relative bg-white overflow-hidden flex flex-col"
        style={{
          width: '100%',
          maxWidth: 430,
          height: '100%',
          maxHeight: 932,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.18)',
          borderRadius: 'clamp(0px, 2vw, 40px)',
        }}
      >
        {/* Screen content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {screen === 'start' && (
            <StartScreen onStart={() => { setScreenHistory([]); setScreen('home'); }} />
          )}
          {screen === 'home' && (
            <HomeScreen
              onFindTrip={() => navigate('trip-finder')}
              onSelectPlace={handleSelectPlace}
              navigate={navigate}
              isLoggedIn={isLoggedIn}
              favorites={favorites}
            />
          )}
          {screen === 'trip-finder' && (
            <TripFinderFlow
              onSearch={handleSearch}
              onBack={() => navigate('home')}
            />
          )}
          {screen === 'results' && (
            <ResultsScreen
              results={searchResults}
              tripInput={tripInput}
              onSelectPlace={handleSelectPlace}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
              onCreatePlan={handleCreateTripPlan}
              onBack={goBack}
              navigate={navigate}
              suggestions={suggestions}
            />
          )}
          {screen === 'place-detail' && selectedPlace && (
            <PlaceDetailScreen
              place={selectedPlace}
              isFavorite={isFavorite(selectedPlace.id)}
              onToggleFavorite={() => handleToggleFavorite(selectedPlace)}
              onCreatePlan={() => handleCreateTripPlan([selectedPlace])}
              onBack={goBack}
            />
          )}
          {screen === 'trip-plan' && tripPlan && (
            <TripPlanScreen
              plan={tripPlan}
              onSave={handleSaveTripPlan}
              onBack={goBack}
              onSelectPlace={handleSelectPlace}
            />
          )}
          {screen === 'saved-trips' && (
            <SavedTripsScreen
              savedTrips={savedTrips}
              onSelectTrip={plan => { setTripPlan(plan); navigate('trip-plan'); }}
              navigate={navigate}
            />
          )}
          {screen === 'favorites' && (
            <FavoritesScreen
              favorites={favorites}
              onSelectPlace={handleSelectPlace}
              onToggleFavorite={handleToggleFavorite}
              navigate={navigate}
            />
          )}
          {screen === 'my-page' && (
            <MyPageScreen
              isLoggedIn={isLoggedIn}
              onLogin={handleLogin}
              onLogout={handleLogout}
              navigate={navigate}
            />
          )}
          {screen === 'guide' && (
            <GuideScreen onBack={goBack} />
          )}
        </div>

        {/* Global Loading Spinner (3.2 & 3.8) */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col items-center max-w-xs text-center border border-gray-100">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-800" style={{ fontWeight: 700, fontSize: '0.9rem' }}>추천 여행지 분석 중</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: '0.78rem' }}>바우처 혜택과 예산을 최적화하고 있습니다. 잠시만 기다려 주세요.</p>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        {showBottomNav && (
          <BottomNav
            currentScreen={screen}
            navigate={navigate}
            favoritesCount={favorites.length}
            savedTripsCount={savedTrips.length}
          />
        )}
      </div>
    </div>
  );
}
