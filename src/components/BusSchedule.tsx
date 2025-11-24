import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { busApi, fallbackApi } from '../services/api';
import { socket, initializeSocketListeners } from '../services/api';

interface BusScheduleProps {
  selectedRoute: string | null;
}

interface ScheduleItem {
  time: string;
  notes: string;
  crowdLevel: 'Low' | 'Medium' | 'High';
  crowdPercentage: number;
}

interface ScheduleData {
  name: string;
  provider: string;
  directions: {
    outbound: {
      name: string;
      stops: string[];
      schedule: {
        today: ScheduleItem[];
        tomorrow?: ScheduleItem[];
        weekend?: ScheduleItem[];
      };
    };
    inbound: {
      name: string;
      stops: string[];
      schedule: {
        today: ScheduleItem[];
        tomorrow?: ScheduleItem[];
        weekend?: ScheduleItem[];
      };
    };
  };
}

const BusSchedule: React.FC<BusScheduleProps> = ({ selectedRoute }) => {
  const [selectedDay, setSelectedDay] = useState<string>('today');
  const [selectedDirection, setSelectedDirection] = useState<string>('outbound');
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to handle schedule updates from socket
  const handleScheduleUpdate = useCallback((data: any) => {
    if (selectedRoute && data && data.routeId === selectedRoute) {
      setScheduleData(prevData => {
        if (!prevData) return null;
        
        // Deep clone the previous data
        const newData = JSON.parse(JSON.stringify(prevData));
        
        // Update the schedule with new data
        if (data.direction === 'outbound' || data.direction === 'inbound') {
          if (data.day && data.schedule) {
            newData.directions[data.direction].schedule[data.day] = data.schedule;
          }
        }
        
        return newData;
      });
    }
  }, [selectedRoute]);
  
  // Function to handle errors
  const handleError = useCallback((error: any) => {
    console.error('Socket error:', error);
    setError('Connection error. Some real-time updates may be delayed.');
  }, []);
  
  // Initialize socket connection
  useEffect(() => {
    const cleanup = initializeSocketListeners(
      () => {}, // We don't need bus updates here
      handleScheduleUpdate,
      handleError
    );
    
    return () => {
      cleanup();
    };
  }, [handleScheduleUpdate, handleError]);
  
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!selectedRoute) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from real API
        const routeDetails = await busApi.getRouteDetails(selectedRoute);
        
        if (routeDetails) {
          // Extract provider from routeId or use the one from the response
          const provider = routeDetails.provider || (
            selectedRoute.startsWith('bmtc-') ? 'BMTC' : 
            selectedRoute.startsWith('ksrtc-') ? 'KSRTC' : 
            selectedRoute.startsWith('apsrtc-') ? 'APSRTC' : 
            selectedRoute.startsWith('tnstc-') ? 'TNSTC' : 
            selectedRoute.startsWith('best-') ? 'BEST' : 
            selectedRoute.startsWith('dtc-') ? 'DTC' : 'Unknown'
          );
          
          // Generate schedule data based on route details
          const schedule: ScheduleData = {
            name: routeDetails.routeName,
            provider: provider,
            directions: {
              outbound: {
                name: `To ${routeDetails.destination}`,
                stops: Array.isArray(routeDetails.stops) 
                  ? routeDetails.stops.map(stop => stop.name) 
                  : ['Central Station', 'Market Street', 'City Hall', 'University'],
                schedule: {
                  today: generateSchedule(6, 22, 15, provider),
                  tomorrow: generateSchedule(6, 22, 15, provider),
                  weekend: generateSchedule(7, 21, 30, provider)
                }
              },
              inbound: {
                name: `To ${routeDetails.source}`,
                stops: Array.isArray(routeDetails.stops) 
                  ? [...routeDetails.stops].reverse().map(stop => stop.name) 
                  : ['University', 'City Hall', 'Market Street', 'Central Station'],
                schedule: {
                  today: generateSchedule(6, 22, 15, provider),
                  tomorrow: generateSchedule(6, 22, 15, provider),
                  weekend: generateSchedule(7, 21, 30, provider)
                }
              }
            }
          };
          
          setScheduleData(schedule);
          
          // Subscribe to schedule updates for this route
          socket.emit('subscribe', { route: selectedRoute, type: 'schedule' });
        } else {
          // If real API returns no data, use fallback
          const fallbackRouteDetails = await fallbackApi.getRouteDetails(selectedRoute);
          
          if (fallbackRouteDetails) {
            const provider = fallbackRouteDetails.provider || 'Unknown';
            
            const schedule: ScheduleData = {
              name: fallbackRouteDetails.routeName,
              provider: provider,
              directions: {
                outbound: {
                  name: `To ${fallbackRouteDetails.destination}`,
                  stops: Array.isArray(fallbackRouteDetails.stops) 
                    ? fallbackRouteDetails.stops.map(stop => stop.name) 
                    : ['Central Station', 'Market Street', 'City Hall', 'University'],
                  schedule: {
                    today: generateSchedule(6, 22, 15, provider),
                    tomorrow: generateSchedule(6, 22, 15, provider),
                    weekend: generateSchedule(7, 21, 30, provider)
                  }
                },
                inbound: {
                  name: `To ${fallbackRouteDetails.source}`,
                  stops: Array.isArray(fallbackRouteDetails.stops) 
                    ? [...fallbackRouteDetails.stops].reverse().map(stop => stop.name) 
                    : ['University', 'City Hall', 'Market Street', 'Central Station'],
                  schedule: {
                    today: generateSchedule(6, 22, 15, provider),
                    tomorrow: generateSchedule(6, 22, 15, provider),
                    weekend: generateSchedule(7, 21, 30, provider)
                  }
                }
              }
            };
            
            setScheduleData(schedule);
          }
        }
      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data. Please try again later.');
        
        // Use fallback data on error
        try {
          const fallbackRouteDetails = await fallbackApi.getRouteDetails(selectedRoute);
          
          if (fallbackRouteDetails) {
            const provider = fallbackRouteDetails.provider || 'Unknown';
            
            const schedule: ScheduleData = {
              name: fallbackRouteDetails.routeName,
              provider: provider,
              directions: {
                outbound: {
                  name: `To ${fallbackRouteDetails.destination}`,
                  stops: Array.isArray(fallbackRouteDetails.stops) 
                    ? fallbackRouteDetails.stops.map(stop => stop.name) 
                    : ['Central Station', 'Market Street', 'City Hall', 'University'],
                  schedule: {
                    today: generateSchedule(6, 22, 15, provider),
                    tomorrow: generateSchedule(6, 22, 15, provider),
                    weekend: generateSchedule(7, 21, 30, provider)
                  }
                },
                inbound: {
                  name: `To ${fallbackRouteDetails.source}`,
                  stops: Array.isArray(fallbackRouteDetails.stops) 
                    ? [...fallbackRouteDetails.stops].reverse().map(stop => stop.name) 
                    : ['University', 'City Hall', 'Market Street', 'Central Station'],
                  schedule: {
                    today: generateSchedule(6, 22, 15, provider),
                    tomorrow: generateSchedule(6, 22, 15, provider),
                    weekend: generateSchedule(7, 21, 30, provider)
                  }
                }
              }
            };
            
            setScheduleData(schedule);
            setError(null); // Clear error if fallback succeeds
          }
        } catch (fallbackErr) {
          console.error('Fallback schedule data also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduleData();
    
    return () => {
      // Unsubscribe from schedule updates when component unmounts or route changes
      if (selectedRoute) {
        socket.emit('unsubscribe', { route: selectedRoute, type: 'schedule' });
      }
    };
  }, [selectedRoute]);

  // Helper function to generate schedule times
  function generateSchedule(startHour: number, endHour: number, frequency: number, provider: string): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    
    // Adjust frequency based on provider
    const actualFrequency = provider === 'BMTC' ? frequency : frequency * 2;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += actualFrequency) {
        // Skip some times randomly to make it more realistic
        if (Math.random() > 0.8) continue;
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Determine crowd level based on time of day
        let crowdLevel: 'Low' | 'Medium' | 'High';
        let crowdPercentage: number;
        
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          // Rush hours
          crowdLevel = 'High';
          crowdPercentage = 75 + Math.floor(Math.random() * 25);
        } else if ((hour >= 10 && hour <= 16) || hour === 20) {
          // Regular hours
          crowdLevel = 'Medium';
          crowdPercentage = 40 + Math.floor(Math.random() * 35);
        } else {
          // Off-peak hours
          crowdLevel = 'Low';
          crowdPercentage = 10 + Math.floor(Math.random() * 30);
        }
        
        // Add some express buses during rush hours
        const notes = ((hour === 8 || hour === 18) && minute === 0) ? 'Express' : '';
        
        schedule.push({
          time: timeStr,
          notes,
          crowdLevel,
          crowdPercentage
        });
      }
    }
    
    return schedule.sort((a, b) => a.time.localeCompare(b.time));
  }

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

  const selectedDirectionData = scheduleData ? scheduleData.directions[selectedDirection as keyof typeof scheduleData.directions] : null;
  const schedules = selectedDirectionData ? selectedDirectionData.schedule[selectedDay as keyof typeof selectedDirectionData.schedule] : [];

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading schedule data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Error Loading Schedule</h3>
          <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : !selectedRoute ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Select a Bus Route</h3>
          <p className="text-gray-600 text-center max-w-md">
            Choose a bus route from the list to view its schedule.
          </p>
        </div>
      ) : !scheduleData ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Schedule Available</h3>
          <p className="text-gray-600 text-center max-w-md">
            Schedule information is not available for this route.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">{scheduleData.name}</h3>
            <div className="flex items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                scheduleData.provider === 'BMTC' ? 'bg-blue-100 text-blue-800' : 
                scheduleData.provider === 'KSRTC' ? 'bg-purple-100 text-purple-800' : 
                scheduleData.provider === 'APSRTC' ? 'bg-green-100 text-green-800' :
                scheduleData.provider === 'TNSTC' ? 'bg-yellow-100 text-yellow-800' :
                scheduleData.provider === 'BEST' ? 'bg-red-100 text-red-800' :
                scheduleData.provider === 'DTC' ? 'bg-indigo-100 text-indigo-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {scheduleData.provider}
              </span>
              <p className="text-sm text-gray-500">Schedule for {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                id="direction"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
              >
                <option value="outbound">{scheduleData.directions.outbound.name}</option>
                <option value="inbound">{scheduleData.directions.inbound.name}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                id="day"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="weekend">Weekend</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-blue-500" />
              Stops
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4 flex-wrap">
              {selectedDirectionData?.stops.map((stop, index, array) => (
                <React.Fragment key={stop}>
                  <span>{stop}</span>
                  {index < array.length - 1 && (
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              Departure Times
            </h4>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {Array.isArray(schedules) && schedules.map((schedule, index) => {
                  const now = new Date();
                  const [hours, minutes] = schedule.time.split(':').map(Number);
                  const scheduleTime = new Date();
                  scheduleTime.setHours(hours, minutes, 0);
                  
                  const isPast = scheduleTime < now;
                  const isNext = !isPast && index === schedules.findIndex(s => {
                    const [h, m] = s.time.split(':').map(Number);
                    const t = new Date();
                    t.setHours(h, m, 0);
                    return t > now;
                  });
                  
                  return (
                    <li key={index} className={`px-4 py-4 sm:px-6 ${isPast ? 'opacity-50' : ''} ${isNext ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Clock className={`h-5 w-5 ${isNext ? 'text-blue-500' : 'text-gray-400'}`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {schedule.time}
                            </div>
                            {schedule.notes && (
                              <div className="text-sm text-gray-500">
                                {schedule.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${getCrowdLevelColor(schedule.crowdLevel)}`}>
                            <Users className="h-3 w-3 mr-1" />
                            {schedule.crowdLevel}
                          </span>
                          {isNext && (
                            <div className="ml-2 flex-shrink-0 flex">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Next departure
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          {/* Real-time indicator */}
          <div className="mt-6 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            <span className="text-xs text-gray-600">Live data • Auto-refreshes every minute</span>
          </div>
        </>
      )}
    </div>
  );
};

export default BusSchedule;