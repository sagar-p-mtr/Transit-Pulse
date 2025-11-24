import React from 'react';
import { Bus, Route, Users, Bell, MapPin, Clock } from 'lucide-react';

const ServicesSection: React.FC = () => {
  const services = [
    {
      icon: <Bus className="h-12 w-12 text-blue-600" />,
      title: "Multi-Operator Support",
      description: "Track buses from BMTC, KSRTC, and other major operators all in one place.",
      features: ["BMTC City Buses", "KSRTC Interstate", "Private Operators", "AC & Non-AC Routes"]
    },
    {
      icon: <Route className="h-12 w-12 text-green-600" />,
      title: "Route Planning",
      description: "Find the best routes with multiple options and real-time recommendations.",
      features: ["Multiple Route Options", "Transfer Points", "Walking Distances", "Time Estimates"]
    },
    {
      icon: <Users className="h-12 w-12 text-purple-600" />,
      title: "Crowd Intelligence",
      description: "AI-powered crowd detection helps you plan your journey for maximum comfort.",
      features: ["Real-time Occupancy", "Crowd Predictions", "Peak Hour Analysis", "Alternative Suggestions"]
    },
    {
      icon: <Bell className="h-12 w-12 text-orange-600" />,
      title: "Smart Notifications",
      description: "Personalized alerts and reminders to keep you informed about your travel.",
      features: ["Arrival Alerts", "Delay Notifications", "Route Changes", "Service Updates"]
    },
    {
      icon: <MapPin className="h-12 w-12 text-red-600" />,
      title: "Live Location",
      description: "Real-time GPS tracking with precise location updates every few seconds.",
      features: ["GPS Tracking", "Stop Announcements", "Landmark References", "ETA Calculations"]
    },
    {
      icon: <Clock className="h-12 w-12 text-indigo-600" />,
      title: "Schedule Management",
      description: "Complete timetable information with holiday schedules and special services.",
      features: ["Regular Schedules", "Holiday Timings", "Special Services", "Frequency Data"]
    }
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive bus tracking and management services designed to make public transportation 
            more accessible, reliable, and user-friendly.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-20 h-20 bg-white rounded-xl shadow-md mb-6 mx-auto">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Learn More Button */}
              <div className="mt-6 text-center">
                <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Service Guarantee */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            24/7 Service Guarantee
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our platform operates round the clock to ensure you have access to real-time bus information 
            whenever you need it. No downtime, no delays in data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">&lt;2s</div>
              <div className="text-blue-100">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support</div>
            </div>
          </div>
        </div>

        {/* API Integration */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Developer API Access
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Integrate our bus tracking data into your applications with our robust API. 
              Perfect for transit apps, city planning tools, and transportation management systems.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                RESTful API with JSON responses
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Real-time WebSocket connections
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Comprehensive documentation
              </li>
              <li className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Rate limiting and authentication
              </li>
            </ul>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              View API Docs
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm overflow-x-auto">
            <div className="text-gray-500 mb-2">// Example API Response</div>
            <div>
              {`{
  "bus_id": "BMTC_500_001",
  "route": "500 - KBS to Whitefield",
  "location": {
    "lat": 12.9716,
    "lng": 77.5946
  },
  "occupancy": "medium",
  "eta": "5 mins",
  "next_stops": ["MG Road", "Brigade Road"]
}`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
