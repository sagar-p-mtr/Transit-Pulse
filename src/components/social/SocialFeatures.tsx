import React, { useState } from 'react';
import { Users, Share2, MessageCircle, Heart, MapPin, Clock, TrendingUp, Award, Star, UserPlus, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RideShare {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    verified: boolean;
  };
  route: string;
  from: string;
  to: string;
  time: string;
  date: string;
  seats: number;
  cost: number;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  content: string;
  type: 'alert' | 'tip' | 'question' | 'review';
  route?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  image?: string;
}

interface SocialFeaturesProps {
  userId?: string;
  currentRoute?: string;
  onClose?: () => void;
}

const SocialFeatures: React.FC<SocialFeaturesProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'rideshare' | 'community' | 'leaderboard'>('rideshare');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideShare | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'alert' | 'tip' | 'question' | 'review'>('tip');
  const [newPostRoute, setNewPostRoute] = useState('');

  // Mock data for ride shares - Enhanced with more entries
  const [rideShares] = useState<RideShare[]>([
    {
      id: '1',
      user: {
        name: 'Priya Sharma',
        avatar: '👩',
        rating: 4.8,
        verified: true
      },
      route: 'Route 500',
      from: 'Whitefield',
      to: 'MG Road',
      time: '8:30 AM',
      date: 'Today',
      seats: 2,
      cost: 25,
      likes: 12,
      comments: 3,
      isLiked: false
    },
    {
      id: '2',
      user: {
        name: 'Rahul Kumar',
        avatar: '👨',
        rating: 4.5,
        verified: true
      },
      route: 'Route 335E',
      from: 'Electronic City',
      to: 'Koramangala',
      time: '6:00 PM',
      date: 'Today',
      seats: 3,
      cost: 20,
      likes: 8,
      comments: 2,
      isLiked: true
    },
    {
      id: '3',
      user: {
        name: 'Anita Desai',
        avatar: '👩‍💼',
        rating: 4.9,
        verified: true
      },
      route: 'Route 201R',
      from: 'Indiranagar',
      to: 'Majestic',
      time: '9:00 AM',
      date: 'Tomorrow',
      seats: 1,
      cost: 30,
      likes: 15,
      comments: 5,
      isLiked: false
    },
    {
      id: '4',
      user: {
        name: 'Vikram Singh',
        avatar: '🧔',
        rating: 4.7,
        verified: false
      },
      route: 'Route 600',
      from: 'Hebbal',
      to: 'Silk Board',
      time: '7:30 AM',
      date: 'Today',
      seats: 4,
      cost: 35,
      likes: 6,
      comments: 1,
      isLiked: false
    },
    {
      id: '5',
      user: {
        name: 'Meera Nair',
        avatar: '👩‍🎓',
        rating: 4.6,
        verified: true
      },
      route: 'Route 335',
      from: 'Banashankari',
      to: 'Shivajinagar',
      time: '8:00 AM',
      date: 'Today',
      seats: 2,
      cost: 22,
      likes: 9,
      comments: 4,
      isLiked: true
    },
    {
      id: '6',
      user: {
        name: 'Arjun Patel',
        avatar: '👨‍💻',
        rating: 4.4,
        verified: true
      },
      route: 'Route 500D',
      from: 'HSR Layout',
      to: 'Brigade Road',
      time: '6:30 PM',
      date: 'Today',
      seats: 3,
      cost: 28,
      likes: 11,
      comments: 7,
      isLiked: false
    }
  ]);

  // Mock data for community posts - Enhanced with more entries
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      user: {
        name: 'Ananya Reddy',
        avatar: '👩‍💼',
        badge: 'Regular Commuter'
      },
      content: 'Route 500 is running 15 minutes late due to traffic at Silk Board. Plan accordingly!',
      type: 'alert',
      route: 'Route 500',
      timestamp: '10 minutes ago',
      likes: 24,
      comments: 8,
      isLiked: true
    },
    {
      id: '2',
      user: {
        name: 'Vikram Singh',
        avatar: '🧔',
        badge: 'Helper'
      },
      content: 'Pro tip: Board from the middle door at Majestic during peak hours for faster boarding!',
      type: 'tip',
      timestamp: '1 hour ago',
      likes: 45,
      comments: 12,
      isLiked: false
    },
    {
      id: '3',
      user: {
        name: 'Sneha Krishnan',
        avatar: '👩‍🔬',
        badge: 'Super Contributor'
      },
      content: 'Does anyone know if Route 335E stops at Forum Mall? Planning to go shopping this weekend.',
      type: 'question',
      timestamp: '2 hours ago',
      likes: 7,
      comments: 15,
      isLiked: false
    },
    {
      id: '4',
      user: {
        name: 'Ravi Kumar',
        avatar: '👨‍🏫',
        badge: 'Daily Commuter'
      },
      content: 'Excellent service on Route 201R today! The driver was very courteous and the bus was clean. Kudos to BMTC! ⭐⭐⭐⭐⭐',
      type: 'review',
      route: 'Route 201R',
      timestamp: '3 hours ago',
      likes: 32,
      comments: 6,
      isLiked: true
    },
    {
      id: '5',
      user: {
        name: 'Lakshmi Iyer',
        avatar: '👵',
        badge: 'Senior Citizen'
      },
      content: '🚨 ALERT: Route 600 cancelled due to road construction near Hebbal flyover. Use alternate routes.',
      type: 'alert',
      route: 'Route 600',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 4,
      isLiked: false
    },
    {
      id: '6',
      user: {
        name: 'Karthik Menon',
        avatar: '👨‍💼',
        badge: 'Bus Enthusiast'
      },
      content: 'Life hack: Download offline maps on your phone. Very helpful when GPS is not working in buses!',
      type: 'tip',
      timestamp: '5 hours ago',
      likes: 28,
      comments: 9,
      isLiked: true
    },
    {
      id: '7',
      user: {
        name: 'Divya Shetty',
        avatar: '👩‍⚕️',
        badge: 'Healthcare Worker'
      },
      content: 'Thank you to the conductor on Route 335 who helped an elderly passenger today. Small acts of kindness matter! 💙',
      type: 'review',
      timestamp: '6 hours ago',
      likes: 56,
      comments: 11,
      isLiked: false
    },
    {
      id: '8',
      user: {
        name: 'Suresh Babu',
        avatar: '👨‍🔧',
        badge: 'Local Guide'
      },
      content: 'Is the new Volvo service on Route 500D worth the extra cost? Looking for honest reviews.',
      type: 'question',
      route: 'Route 500D',
      timestamp: '1 day ago',
      likes: 12,
      comments: 23,
      isLiked: false
    }
  ]);

  const getPostTypeIcon = (type: string) => {
    switch(type) {
      case 'alert': return '🚨';
      case 'tip': return '💡';
      case 'question': return '❓';
      case 'review': return '⭐';
      default: return '📝';
    }
  };

  const handleNewPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        avatar: '👤',
        badge: 'New Member'
      },
      content: newPostContent,
      type: newPostType,
      route: newPostRoute || undefined,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setCommunityPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setNewPostRoute('');
    setShowNewPostModal(false);
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Community & Social
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow commuters and share your journey
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('rideshare')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'rideshare'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Ride Share
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'community'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="inline-block w-4 h-4 mr-2" />
                Community
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Award className="inline-block w-4 h-4 mr-2" />
                Leaderboard
              </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'rideshare' && (
                <motion.div
                  key="rideshare"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Available Ride Shares
                    </h3>
                    <button 
                      onClick={() => alert('Create Ride feature coming soon! 🚗')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="inline-block w-4 h-4 mr-2" />
                      Create Ride
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {rideShares.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{ride.user.avatar}</div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {ride.user.name}
                                </span>
                                {ride.user.verified && (
                                  <span className="text-blue-500">✓</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{ride.user.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">₹{ride.cost}</div>
                            <div className="text-sm text-gray-500">per seat</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>From: {ride.from}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span>To: {ride.to}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{ride.date} at {ride.time}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{ride.seats} seats available</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              className={`flex items-center space-x-1 text-sm transition-colors ${
                                ride.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${ride.isLiked ? 'fill-current' : ''}`} />
                              <span>{ride.likes}</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{ride.comments}</span>
                            </button>
                          </div>
                          <div className="space-x-2">
                            <button className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                              Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRide(ride);
                                setShowShareModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Join Ride
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Community Posts
                    </h3>
                    <button 
                      onClick={() => setShowNewPostModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      New Post
                    </button>
                  </div>

                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{post.user.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {post.user.name}
                              </span>
                              {post.user.badge && (
                                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                                  {post.user.badge}
                                </span>
                              )}
                              <span className="text-2xl">{getPostTypeIcon(post.type)}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {post.content}
                            </p>
                            {post.route && (
                              <div className="mb-2">
                                <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                  {post.route}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleLikePost(post.id)}
                                  className={`flex items-center space-x-1 text-sm transition-colors ${
                                    post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                                  <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post.comments}</span>
                                </button>
                                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                  <Share2 className="w-4 h-4" />
                                  <span>Share</span>
                                </button>
                              </div>
                              <span className="text-sm text-gray-500">
                                {post.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      🏆 Top Contributors This Month
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { rank: 1, name: 'Ananya Reddy', avatar: '👩‍💼', contributions: 89, badge: 'Super Helper', points: 245 },
                        { rank: 2, name: 'Vikram Singh', avatar: '🧔', contributions: 76, badge: 'Route Expert', points: 198 },
                        { rank: 3, name: 'Karthik Menon', avatar: '👨‍💼', contributions: 65, badge: 'Bus Enthusiast', points: 167 },
                        { rank: 4, name: 'Divya Shetty', avatar: '👩‍⚕️', contributions: 52, badge: 'Daily Commuter', points: 134 },
                        { rank: 5, name: 'Ravi Kumar', avatar: '👨‍🏫', contributions: 48, badge: 'Helper', points: 126 },
                        { rank: 6, name: 'Sneha Krishnan', avatar: '👩‍🔬', contributions: 41, badge: 'Regular User', points: 98 },
                        { rank: 7, name: 'Suresh Babu', avatar: '👨‍🔧', contributions: 38, badge: 'Local Guide', points: 87 },
                        { rank: 8, name: 'Lakshmi Iyer', avatar: '👵', contributions: 32, badge: 'Senior Member', points: 76 }
                      ].map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                              user.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                              user.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                              user.rank === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
                              'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                            }`}>
                              {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                            </div>
                            <div className="text-2xl">{user.avatar}</div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                                {user.rank <= 3 && <span className="ml-2 text-sm">⭐</span>}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {user.contributions} posts • {user.badge}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-bold">{user.points}</span>
                            </div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        🎯 How to Earn Points
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                        <li>• Share helpful tips: +5 points</li>
                        <li>• Report delays/issues: +3 points</li>
                        <li>• Answer questions: +2 points</li>
                        <li>• Get likes on posts: +1 point each</li>
                        <li>• Daily check-in: +1 point</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Join Ride Modal */}
          {showShareModal && selectedRide && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                >
                  <h3 className="text-xl font-bold mb-4">Join Ride Share</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Driver:</span>
                      <span className="font-medium">{selectedRide.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route:</span>
                      <span className="font-medium">{selectedRide.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Journey:</span>
                      <span className="font-medium">{selectedRide.from} → {selectedRide.to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="font-medium">{selectedRide.date} at {selectedRide.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost per seat:</span>
                      <span className="font-medium text-green-600">₹{selectedRide.cost}</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowShareModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(false);
                        // Handle join ride logic here
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Ride
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* New Post Modal */}
          {showNewPostModal && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Post</h3>
                    <button
                      onClick={() => setShowNewPostModal(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Post Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Post Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'tip', label: 'Tip', icon: '💡' },
                          { value: 'question', label: 'Question', icon: '❓' },
                          { value: 'alert', label: 'Alert', icon: '🚨' },
                          { value: 'review', label: 'Review', icon: '⭐' }
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setNewPostType(type.value as any)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              newPostType === type.value
                                ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-center space-x-1">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Route (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Route (Optional)
                      </label>
                      <input
                        type="text"
                        value={newPostRoute}
                        onChange={(e) => setNewPostRoute(e.target.value)}
                        placeholder="e.g., Route 500, Route 335E"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Message *
                      </label>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your thoughts, tips, or questions with the community..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                      />
                      <div className="text-right text-sm text-gray-500 mt-1">
                        {newPostContent.length}/280
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShowNewPostModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNewPost}
                      disabled={!newPostContent.trim() || newPostContent.length > 280}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SocialFeatures;