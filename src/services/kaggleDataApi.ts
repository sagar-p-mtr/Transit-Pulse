import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface KaggleDataset {
  ref: string;
  title: string;
  description: string;
  size: number;
  lastUpdated: string;
  downloadCount: number;
}

export interface DataSummary {
  routes: number;
  stops: number;
  patterns: number;
  suggestions: number;
}

export interface PopulateDataResponse {
  success: boolean;
  message: string;
  data: {
    routes: number;
    stops: number;
    patterns: number;
    suggestions: number;
  };
}

class KaggleDataApi {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/kaggle`;
  }

  // Search for relevant datasets
  async searchDatasets(query: string = 'Indian public transport bus routes'): Promise<KaggleDataset[]> {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { query }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching datasets:', error);
      return [];
    }
  }

  // Populate database with real/sample data
  async populateDatabase(userId: string = '00000000-0000-0000-0000-000000000001'): Promise<PopulateDataResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/populate`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error populating database:', error);
      throw error;
    }
  }

  // Get data summary
  async getDataSummary(): Promise<DataSummary> {
    try {
      const response = await axios.get(`${this.baseURL}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting data summary:', error);
      throw error;
    }
  }

  // Download specific dataset
  async downloadDataset(datasetName: string, datasetVersion: string = 'latest'): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/download`, {
        datasetName,
        datasetVersion
      });
      return response.data.filePath;
    } catch (error) {
      console.error('Error downloading dataset:', error);
      throw error;
    }
  }
}

export const kaggleDataApi = new KaggleDataApi();
