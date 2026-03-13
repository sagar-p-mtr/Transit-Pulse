import React from 'react';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Youtube, Bus, Users, Clock, CheckCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Services", href: "#services" },
    { name: "Coverage", href: "#coverage" },
    { name: "About", href: "#about" }
  ];

  const services = [
    { name: "Real-time Tracking", href: "#" },
    { name: "Route Planning", href: "#" },
    { name: "Crowd Detection", href: "#" },
    { name: "Schedule Information", href: "#" },
    { name: "API Access", href: "#" }
  ];

  const support = [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Report Issue", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" }
  ];

  const operators = [
    { name: "BMTC", description: "Bangalore Metropolitan Transport Corporation" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Bus className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">Transit Pulse</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Making public transportation smarter, more reliable, and accessible for everyone. 
              Real-time bus tracking powered by AI and IoT technology.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-300">Bangalore, Karnataka, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-300">contact@transitpulse.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-300">+91 80 1234 5678</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-6">Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a 
                    href={service.href}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              {support.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* App Download */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Download Our App</h4>
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="block bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <div className="text-sm text-gray-300">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </div>
                </a>
                <a 
                  href="#" 
                  className="block bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <div className="text-sm text-gray-300">Get it on</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Transport Operators */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Transport Partners</h3>
            <div className="space-y-4">
              {operators.map((operator, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-400">{operator.name}</h4>
                  <p className="text-sm text-gray-400">{operator.description}</p>
                </div>
              ))}
            </div>

            {/* Status Indicators */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">All systems operational</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300">99.9% uptime this month</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-300">50K+ active users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest updates about new routes, features, and improvements to our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-500 mb-1">50K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500 mb-1">720+</div>
              <div className="text-sm text-gray-400">Routes Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500 mb-1">4.8★</div>
              <div className="text-sm text-gray-400">User Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500 mb-1">24/7</div>
              <div className="text-sm text-gray-400">Live Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2024 Transit Pulse. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                API Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
