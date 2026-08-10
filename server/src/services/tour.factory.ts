import { ITourService } from './tour.interface.js';
import { TourMockService } from './tour.mock.js';
import { TourRealService } from './tour.real.js';
import dotenv from 'dotenv';
dotenv.config();

export class TourServiceFactory {
  private static instance: ITourService;

  public static getService(): ITourService {
    if (!this.instance) {
      const useMock = process.env.USE_MOCK_API === 'true';
      if (useMock) {
        console.log('🔌 Using TourAPI Mock Service');
        this.instance = new TourMockService();
      } else {
        console.log('🌐 Using TourAPI Real Service');
        this.instance = new TourRealService();
      }
    }
    return this.instance;
  }
}
