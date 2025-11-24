/**
 * Weather-Aware Routes Service
 * Provides weather-based route recommendations
 */

const db = require('../config/database');
const axios = require('axios');

class WeatherService {
  constructor() {
    this.API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
    this.CITY_COORDS = {
      'Bangalore': { lat: 12.9716, lon: 77.5946 },
      'Delhi': { lat: 28.7041, lon: 77.1025 },
      'Mumbai': { lat: 19.0760, lon: 72.8777 },
      'Chennai': { lat: 13.0827, lon: 80.2707 },
      'Hyderabad': { lat: 17.3850, lon: 78.4867 },
      'Pune': { lat: 18.5204, lon: 73.8567 }
    };
  }

  /**
   * Fetch current weather for a city
   */
  async fetchCurrentWeather(city) {
    try {
      const coords = this.CITY_COORDS[city];
      if (!coords) {
        throw new Error(`Unknown city: ${city}`);
      }

      // In demo mode, generate mock weather
      if (this.API_KEY === 'demo_key') {
        return this.generateMockWeather(city);
      }

      const response = await axios.get(`${this.BASE_URL}/weather`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.API_KEY,
          units: 'metric'
        }
      });

      const data = response.data;
      
      const weatherData = {
        city,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        rain1h: data.rain?.['1h'] || 0,
        rain3h: data.rain?.['3h'] || 0,
        visibility: data.visibility,
        timestamp: new Date()
      };

      // Save to database
      await this.saveWeatherData(weatherData);

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error.message);
      // Return mock data on error
      return this.generateMockWeather(city);
    }
  }

  /**
   * Generate mock weather data for demo
   */
  generateMockWeather(city) {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Mist'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      city,
      temperature: 25 + Math.random() * 10,
      feelsLike: 26 + Math.random() * 10,
      condition: randomCondition,
      description: randomCondition.toLowerCase(),
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      rain1h: randomCondition === 'Rain' ? Math.random() * 10 : 0,
      rain3h: randomCondition === 'Rain' ? Math.random() * 20 : 0,
      visibility: 5000 + Math.random() * 5000,
      timestamp: new Date()
    };
  }

  /**
   * Save weather data to database
   */
  async saveWeatherData(weatherData) {
    try {
      await db.query(
        `INSERT INTO weather_data 
         (city, temperature, feels_like, condition, description, humidity, 
          wind_speed, rain_1h, rain_3h, visibility, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          weatherData.city,
          weatherData.temperature,
          weatherData.feelsLike,
          weatherData.condition,
          weatherData.description,
          weatherData.humidity,
          weatherData.windSpeed,
          weatherData.rain1h,
          weatherData.rain3h,
          weatherData.visibility,
          weatherData.timestamp
        ]
      );
    } catch (error) {
      console.error('Error saving weather data:', error);
    }
  }

  /**
   * Get weather-aware route recommendations
   */
  async getWeatherAwareRoutes(sourceStopId, destinationStopId, city) {
    try {
      // Get current weather
      const weather = await this.fetchCurrentWeather(city);

      // Get all possible routes
      const routes = await db.query(
        `SELECT r.*, 
         (SELECT COUNT(*) FROM jsonb_array_elements(r.stops) WHERE value->>'id' = $1) as has_source,
         (SELECT COUNT(*) FROM jsonb_array_elements(r.stops) WHERE value->>'id' = $2) as has_dest
         FROM routes r
         WHERE r.city = $3`,
        [sourceStopId, destinationStopId, city]
      );

      // Score each route based on weather
      const scoredRoutes = await Promise.all(
        routes.rows.map(async (route) => {
          const weatherScore = await this.calculateWeatherScore(route, weather);
          return {
            ...route,
            weatherScore,
            weatherReason: this.getWeatherReason(route, weather, weatherScore)
          };
        })
      );

      // Sort by weather score (descending)
      scoredRoutes.sort((a, b) => b.weatherScore - a.weatherScore);

      return {
        weather,
        routes: scoredRoutes,
        recommendations: scoredRoutes.slice(0, 3)
      };
    } catch (error) {
      console.error('Error getting weather-aware routes:', error);
      throw error;
    }
  }

  /**
   * Calculate weather score for a route
   */
  async calculateWeatherScore(route, weather) {
    try {
      let score = 0.5; // Base neutral score

      // Get covered stops percentage
      const stops = route.stops || [];
      let coveredCount = 0;

      for (const stop of stops) {
        const facilityResult = await db.query(
          'SELECT * FROM bus_stop_facilities WHERE stop_id = $1',
          [stop.id]
        );
        
        if (facilityResult.rows.length > 0 && facilityResult.rows[0].is_covered) {
          coveredCount++;
        }
      }

      const coveredPercentage = stops.length > 0 ? coveredCount / stops.length : 0;

      // Weather-based scoring
      if (weather.condition === 'Rain' || weather.condition === 'Drizzle') {
        // Prefer routes with more covered stops
        score = 0.3 + (coveredPercentage * 0.7); // 0.3 to 1.0
      } else if (weather.condition === 'Clear' && weather.temperature > 35) {
        // Hot weather - prefer AC buses and covered stops
        score = 0.4 + (coveredPercentage * 0.6);
      } else if (weather.condition === 'Mist' && weather.visibility < 2000) {
        // Low visibility - prefer routes with better infrastructure
        score = 0.3 + (coveredPercentage * 0.7);
      } else {
        // Normal weather
        score = 0.6 + (coveredPercentage * 0.4);
      }

      // Check for flood reports on this route
      const floodReports = await db.query(
        `SELECT COUNT(*) as flood_count 
         FROM flood_reports 
         WHERE status = 'active' 
         AND created_at > datetime('now', '-2 hours')`
      );

      if (floodReports.rows[0].flood_count > 0) {
        score *= 0.5; // Reduce score by 50% if floods reported
      }

      return Number(score.toFixed(2));
    } catch (error) {
      console.error('Error calculating weather score:', error);
      return 0.5;
    }
  }

  /**
   * Get human-readable weather reason
   */
  getWeatherReason(route, weather, score) {
    if (weather.condition === 'Rain') {
      if (score > 0.7) {
        return '☔ Highly recommended - Most stops are covered';
      } else if (score > 0.5) {
        return '⚠️ Moderate - Some stops are exposed';
      } else {
        return '❌ Not recommended - Most stops uncovered, you\'ll get wet';
      }
    } else if (weather.temperature > 35) {
      if (score > 0.7) {
        return '🌡️ Good choice - AC bus with covered stops';
      } else {
        return '☀️ Hot - Limited shade at stops';
      }
    } else if (weather.condition === 'Mist') {
      return '🌫️ Low visibility - Well-lit route recommended';
    }
    return '✅ Normal weather - All routes suitable';
  }

  /**
   * Report flood/waterlogging
   */
  async reportFlood(reportData) {
    try {
      const { userId, stopId, latitude, longitude, severity, description } = reportData;

      const result = await db.query(
        `INSERT INTO flood_reports 
         (stop_id, latitude, longitude, severity, reported_by, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING *`,
        [stopId, latitude, longitude, severity, userId, description]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error reporting flood:', error);
      throw error;
    }
  }

  /**
   * Get active flood reports
   */
  async getActiveFloodReports(city) {
    try {
      const result = await db.query(
        `SELECT fr.*, bs.name as stop_name, bs.city
         FROM flood_reports fr
         LEFT JOIN bus_stops bs ON fr.stop_id = bs.id
         WHERE fr.status = 'active' 
         AND fr.created_at > datetime('now', '-6 hours')
         AND (bs.city = $1 OR $1 IS NULL)
         ORDER BY fr.severity DESC, fr.upvotes DESC`,
        [city]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching flood reports:', error);
      throw error;
    }
  }

  /**
   * Upvote flood report
   */
  async upvoteFloodReport(reportId) {
    try {
      await db.query(
        'UPDATE flood_reports SET upvotes = upvotes + 1 WHERE id = $1',
        [reportId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error upvoting report:', error);
      throw error;
    }
  }

  /**
   * Get weather forecast (24 hours)
   */
  async getWeatherForecast(city) {
    try {
      const coords = this.CITY_COORDS[city];
      if (!coords) {
        throw new Error(`Unknown city: ${city}`);
      }

      if (this.API_KEY === 'demo_key') {
        return this.generateMockForecast(city);
      }

      const response = await axios.get(`${this.BASE_URL}/forecast`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.API_KEY,
          units: 'metric',
          cnt: 8 // 24 hours (3-hour intervals)
        }
      });

      return response.data.list.map(item => ({
        time: new Date(item.dt * 1000),
        temperature: item.main.temp,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        rain: item.rain?.['3h'] || 0
      }));
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.generateMockForecast(city);
    }
  }

  /**
   * Generate mock forecast
   */
  generateMockForecast(city) {
    const forecast = [];
    const now = new Date();
    
    for (let i = 0; i < 8; i++) {
      const time = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000));
      forecast.push({
        time,
        temperature: 25 + Math.random() * 8,
        condition: i % 3 === 0 ? 'Rain' : 'Clear',
        description: i % 3 === 0 ? 'light rain' : 'clear sky',
        rain: i % 3 === 0 ? Math.random() * 5 : 0
      });
    }
    
    return forecast;
  }
}

module.exports = new WeatherService();

