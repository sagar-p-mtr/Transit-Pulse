import React, { useEffect, useState } from 'react';
import { X, Clock, Bus, MapPin, AlertTriangle, Users } from 'lucide-react';
import { busApi, fallbackApi } from '../services/api';
import { StopDetails } from '../services/mockData';

interface BusStopInfoProps {
  stopId: string;
  onClose: () => void;
  user?: any;
}

const BusStopInfo: React.FC<BusStopInfoProps> = ({ stopId, onClose, user }) => {
  const [stopData, setStopData] = useState<StopDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStopData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from real API
        const data = await busApi.getStopDetails(stopId);
        
        if (data) {
          setStopData(data as StopDetails);
        } else {
          // If real API returns no data, use fallback
          const fallbackData = fallbackApi.getStopDetails(stopId);
          setStopData(fallbackData);
        }
      } catch (err) {
        console.error('Error fetching stop data:', err);
        setError('Failed to load stop data. Please try again later.');
        
        // Use fallback data on error
        try {
          const fallbackData = fallbackApi.getStopDetails(stopId);
          setStopData(fallbackData);
          setError(null); // Clear error if fallback succeeds
        } catch (fallbackErr) {
          console.error('Fallback stop data also failed:', fallbackErr);
          setError('Failed to load stop data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStopData();
    
    // Set up interval to refresh data
    const intervalId = setInterval(fetchStopData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [stopId]);

  // Function to get crowd level color
  const getCrowdLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get crowd level progress bar color
  const getCrowdLevelProgressColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'High':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to get provider badge color
  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'BMTC':
        return 'bg-blue-100 text-blue-800';
      case 'MTC':
        return 'bg-green-100 text-green-800';
      case 'MSRTC':
        return 'bg-purple-100 text-purple-800';
      case 'Cluster':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stop information...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        ) : !stopData ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stop Not Found</h3>
            <p className="text-gray-600 mb-4">The requested bus stop could not be found.</p>
            <button
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                {stopData.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">{stopData.address}</p>
              </div>
              
              {/* Current Crowd Level */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-blue-500" />
                  Current Crowd Level
                </h4>
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getCrowdLevelColor(stopData.crowdLevel)}`}>
                    {stopData.crowdLevel}
                  </span>
                  <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getCrowdLevelProgressColor(stopData.crowdLevel)}`} 
                      style={{ width: `${stopData.crowdPercentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">{stopData.crowdPercentage}%</span>
                </div>
                <p className="text-xs text-gray-500">
                  {stopData.crowdLevel === 'Low' && 'Plenty of space available. Easy to find a seat.'}
                  {stopData.crowdLevel === 'Medium' && 'Moderately busy. Some seats may be available.'}
                  {stopData.crowdLevel === 'High' && 'Very crowded. Standing room only.'}
                </p>
              </div>

              {/* Crowd History */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Crowd Trends Today</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-end h-24 space-x-1">
                    {stopData.crowdHistory.map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full rounded-t ${getCrowdLevelProgressColor(item.level)}`} 
                          style={{ height: `${item.percentage}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {stopData.alerts.length > 0 && (
                <div className="mb-4">
                  {stopData.alerts.map((alert, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-md ${
                        alert.type === 'info' ? 'bg-blue-50 text-blue-700' : 
                        alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 
                        'bg-red-50 text-red-700'
                      } flex items-start`}
                    >
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {stopData.amenities.map((amenity, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Routes Serving This Stop</h4>
                <div className="flex gap-2">
                  {stopData.routes.map((route, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {route}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-blue-500" />
                  Upcoming Buses
                </h4>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {stopData.upcomingBuses.map((bus, index) => (
                      <li key={index} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Bus className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                Route {bus.route}
                              </p>
                              <p className="text-sm text-gray-500">
                                To {bus.destination}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-900">
                              {bus.time}
                            </p>
                            <div className="flex items-center">
                              <p className={`text-xs mr-2 ${
                                bus.status === 'On time' ? 'text-green-600' : 
                                bus.status === 'Slight delay' ? 'text-yellow-600' : 
                                'text-red-600'
                              }`}>
                                {bus.status}
                              </p>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCrowdLevelColor(bus.crowdLevel)}`}>
                                {bus.crowdLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusStopInfo;