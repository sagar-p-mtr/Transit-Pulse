import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data for initial population
const sampleRoutes = [
  {
    route_number: '201E',
    route_name: 'Kempegowda Bus Station - Electronic City',
    start_location: 'Kempegowda Bus Station',
    end_location: 'Electronic City',
    total_stops: 25,
    estimated_duration: 90,
    fare: 25,
    is_active: true
  },
  {
    route_number: '500DA',
    route_name: 'Shivajinagar - Kengeri',
    start_location: 'Shivajinagar',
    end_location: 'Kengeri',
    total_stops: 35,
    estimated_duration: 120,
    fare: 30,
    is_active: true
  },
  {
    route_number: '356',
    route_name: 'Majestic - Whitefield',
    start_location: 'Majestic',
    end_location: 'Whitefield',
    total_stops: 40,
    estimated_duration: 150,
    fare: 35,
    is_active: true
  }
];

const sampleStops = [
  {
    stop_name: 'Kempegowda Bus Station',
    location: { latitude: 12.9767, longitude: 77.5993 },
    address: 'Kempegowda Bus Station, Gubbi Thotadappa Rd, Majestic, Bengaluru',
    routes: ['201E', '500DA', '356']
  },
  {
    stop_name: 'Electronic City',
    location: { latitude: 12.8456, longitude: 77.6603 },
    address: 'Electronic City Phase 1, Electronic City, Bengaluru',
    routes: ['201E']
  },
  {
    stop_name: 'Silk Board',
    location: { latitude: 12.9174, longitude: 77.6226 },
    address: 'Silk Board Junction, Bengaluru',
    routes: ['201E', '356']
  },
  {
    stop_name: 'Shivajinagar',
    location: { latitude: 12.9899, longitude: 77.6006 },
    address: 'Shivajinagar Bus Stand, Bengaluru',
    routes: ['500DA']
  },
  {
    stop_name: 'Whitefield',
    location: { latitude: 12.9698, longitude: 77.7500 },
    address: 'Whitefield Main Road, Bengaluru',
    routes: ['356']
  }
];

const sampleBuses = [
  {
    route_number: '201E',
    route_name: 'Kempegowda Bus Station - Electronic City',
    current_stop: 'Kempegowda Bus Station',
    next_stop: 'Chickpet',
    location: { latitude: 12.9767, longitude: 77.5993 },
    occupancy_level: 'Medium' as const,
    delay_minutes: 5,
    is_active: true,
    last_updated: new Date()
  },
  {
    route_number: '201E',
    route_name: 'Kempegowda Bus Station - Electronic City',
    current_stop: 'Silk Board',
    next_stop: 'BTM Layout',
    location: { latitude: 12.9174, longitude: 77.6226 },
    occupancy_level: 'High' as const,
    delay_minutes: 12,
    is_active: true,
    last_updated: new Date()
  },
  {
    route_number: '500DA',
    route_name: 'Shivajinagar - Kengeri',
    current_stop: 'Shivajinagar',
    next_stop: 'Cubbon Park',
    location: { latitude: 12.9899, longitude: 77.6006 },
    occupancy_level: 'Low' as const,
    delay_minutes: 2,
    is_active: true,
    last_updated: new Date()
  },
  {
    route_number: '356',
    route_name: 'Majestic - Whitefield',
    current_stop: 'Majestic',
    next_stop: 'KR Market',
    location: { latitude: 12.9767, longitude: 77.5993 },
    occupancy_level: 'Medium' as const,
    delay_minutes: 8,
    is_active: true,
    last_updated: new Date()
  }
];

export class FirebaseMigration {
  
  // Check if collection exists and has data
  async checkCollectionExists(collectionName: string): Promise<boolean> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return !querySnapshot.empty;
    } catch (error) {
      console.error(`Error checking collection ${collectionName}:`, error);
      return false;
    }
  }

  // Populate routes collection
  async populateRoutes(): Promise<void> {
    console.log('🚌 Populating routes...');
    const routesCollection = collection(db, 'routes');
    
    for (const route of sampleRoutes) {
      try {
        await addDoc(routesCollection, route);
        console.log(`✅ Added route: ${route.route_number}`);
      } catch (error) {
        console.error(`❌ Error adding route ${route.route_number}:`, error);
      }
    }
  }

  // Populate stops collection
  async populateStops(): Promise<void> {
    console.log('🏢 Populating stops...');
    const stopsCollection = collection(db, 'stops');
    
    for (const stop of sampleStops) {
      try {
        await addDoc(stopsCollection, stop);
        console.log(`✅ Added stop: ${stop.stop_name}`);
      } catch (error) {
        console.error(`❌ Error adding stop ${stop.stop_name}:`, error);
      }
    }
  }

  // Populate buses collection
  async populateBuses(): Promise<void> {
    console.log('🚍 Populating buses...');
    const busesCollection = collection(db, 'buses');
    
    for (const bus of sampleBuses) {
      try {
        await addDoc(busesCollection, bus);
        console.log(`✅ Added bus on route: ${bus.route_number}`);
      } catch (error) {
        console.error(`❌ Error adding bus on route ${bus.route_number}:`, error);
      }
    }
  }

  // Run full migration
  async runMigration(): Promise<void> {
    console.log('🔄 Starting Firebase migration...');
    
    try {
      // Check if data already exists
      const routesExist = await this.checkCollectionExists('routes');
      const stopsExist = await this.checkCollectionExists('stops');
      const busesExist = await this.checkCollectionExists('buses');

      if (!routesExist) {
        await this.populateRoutes();
      } else {
        console.log('📋 Routes already exist, skipping...');
      }

      if (!stopsExist) {
        await this.populateStops();
      } else {
        console.log('🏢 Stops already exist, skipping...');
      }

      if (!busesExist) {
        await this.populateBuses();
      } else {
        console.log('🚍 Buses already exist, skipping...');
      }

      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  // Add more sample data for testing
  async addMoreSampleData(): Promise<void> {
    const additionalRoutes = [
      {
        route_number: '300',
        route_name: 'JP Nagar - Hebbal',
        start_location: 'JP Nagar',
        end_location: 'Hebbal',
        total_stops: 30,
        estimated_duration: 110,
        fare: 28,
        is_active: true
      },
      {
        route_number: '400',
        route_name: 'Banashankari - Airport',
        start_location: 'Banashankari',
        end_location: 'Kempegowda International Airport',
        total_stops: 45,
        estimated_duration: 180,
        fare: 50,
        is_active: true
      }
    ];

    const routesCollection = collection(db, 'routes');
    for (const route of additionalRoutes) {
      await addDoc(routesCollection, route);
      console.log(`✅ Added additional route: ${route.route_number}`);
    }
  }
}

export const firebaseMigration = new FirebaseMigration();
