import React from 'react';
import { Smartphone, MapPin, Clock, Users, Zap, Shield } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      title: "Real-Time Tracking",
      description: "Track buses in real-time with precise GPS location updates. Never miss your bus again with accurate arrival predictions."
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Schedule Information",
      description: "Access comprehensive bus schedules, route timings, and frequency information for all major bus services."
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Crowd Detection",
      description: "AI-powered crowd analysis helps you choose less crowded buses for a more comfortable journey."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-orange-600" />,
      title: "Mobile First",
      description: "Optimized for mobile devices with offline capabilities. Works seamlessly across all platforms."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Instant Notifications",
      description: "Get real-time alerts for delays, route changes, and your favorite bus arrivals."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Reliable & Secure",
      description: "Privacy-focused design with secure data handling. Your personal information stays protected."
    }
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to make your bus travel experience smooth, efficient, and stress-free.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Commute?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied users who have made their daily travel more predictable and comfortable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Download App
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
            <div className="text-gray-600">Bus Routes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">1M+</div>
            <div className="text-gray-600">Trips Tracked</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
            <div className="text-gray-600">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
