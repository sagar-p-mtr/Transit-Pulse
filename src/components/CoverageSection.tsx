import React from 'react';
import { MapPin, Users, CheckCircle } from 'lucide-react';

const CoverageSection: React.FC = () => {
  const cities = [
    {
      name: "Bangalore",
      routes: 350,
      buses: 2500,
      coverage: 95,
      operators: ["BMTC", "Private"],
      status: "full"
    },
    {
      name: "Mysore",
      routes: 120,
      buses: 800,
      coverage: 90,
      operators: ["City Bus"],
      status: "full"
    },
    {
      name: "Hubli",
      routes: 85,
      buses: 550,
      coverage: 85,
      operators: ["NWKRTC"],
      status: "full"
    },
    {
      name: "Mangalore",
      routes: 95,
      buses: 650,
      coverage: 88,
      operators: ["Private"],
      status: "full"
    },
    {
      name: "Belgaum",
      routes: 70,
      buses: 450,
      coverage: 82,
      operators: ["NWKRTC"],
      status: "coming"
    },
    {
      name: "Gulbarga",
      routes: 60,
      buses: 400,
      coverage: 80,
      operators: ["NEKRTC"],
      status: "coming"
    }
  ];

  const stateRoutes = [
    {
      route: "Bangalore - Mysore",
      operator: "City Bus",
      frequency: "Every 30 mins",
      distance: "150 km",
      buses: 45
    },
    {
      route: "Bangalore - Hubli",
      operator: "NWKRTC",
      frequency: "Every 45 mins",
      distance: "410 km",
      buses: 32
    },
    {
      route: "Bangalore - Mangalore",
      operator: "Private",
      frequency: "Every 60 mins",
      distance: "350 km",
      buses: 28
    },
    {
      route: "Mysore - Hassan",
      operator: "City Bus",
      frequency: "Every 45 mins",
      distance: "118 km",
      buses: 20
    }
  ];

  return (
    <section id="coverage" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Coverage Area
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive bus tracking coverage across Karnataka with plans to expand to neighboring states. 
            Real-time data from multiple transport operators.
          </p>
        </div>

        {/* Coverage Map Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Karnataka State Coverage
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900">Active Cities</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">4</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900">Total Routes</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">720+</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900">Active Buses</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">4,950+</span>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-8 text-center relative overflow-hidden">
              <div className="relative z-10">
                <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map</h4>
                <p className="text-gray-600 mb-4">
                  Explore our coverage area with an interactive map showing all tracked routes and real-time bus locations.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  View Full Map
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 left-4 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="absolute top-12 right-8 w-2 h-2 bg-green-600 rounded-full animate-pulse delay-300"></div>
                <div className="absolute bottom-8 left-12 w-4 h-4 bg-purple-600 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* City Coverage Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            City-wise Coverage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{city.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    city.status === 'full' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {city.status === 'full' ? 'Active' : 'Coming Soon'}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Routes</span>
                    <span className="font-medium">{city.routes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buses</span>
                    <span className="font-medium">{city.buses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coverage</span>
                    <span className="font-medium">{city.coverage}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Coverage Progress</span>
                    <span className="text-gray-900">{city.coverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${city.coverage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600 mb-2 block">Operators:</span>
                  <div className="flex flex-wrap gap-2">
                    {city.operators.map((operator, opIndex) => (
                      <span 
                        key={opIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {operator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interstate Routes */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Major Interstate Routes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stateRoutes.map((route, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">{route.route}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operator:</span>
                    <span className="font-medium">{route.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium">{route.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{route.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Buses:</span>
                    <span className="font-medium">{route.buses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expansion Plans */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Expansion Plans
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            We're continuously expanding our coverage to include more cities across South India. 
            Tamil Nadu, Andhra Pradesh, and Kerala are next on our roadmap.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Q2 2024</div>
              <div className="text-blue-100">Chennai, Coimbatore</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Q3 2024</div>
              <div className="text-blue-100">Hyderabad, Visakhapatnam</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Q4 2024</div>
              <div className="text-blue-100">Kochi, Thiruvananthapuram</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
