import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Users, MapPin, Clock, Bus, Zap } from 'lucide-react';

const StatsSection: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBuses: 0,
    routesCovered: 0,
    tripsCompleted: 0,
    timesSaved: 0,
    citiesCovered: 0
  });

  const targetStats = {
    totalUsers: 52847,
    activeBuses: 4950,
    routesCovered: 720,
    tripsCompleted: 1250000,
    timesSaved: 125000,
    citiesCovered: 4
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        activeBuses: Math.floor(targetStats.activeBuses * progress),
        routesCovered: Math.floor(targetStats.routesCovered * progress),
        tripsCompleted: Math.floor(targetStats.tripsCompleted * progress),
        timesSaved: Math.floor(targetStats.timesSaved * progress),
        citiesCovered: Math.floor(targetStats.citiesCovered * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setStats(targetStats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const mainStats = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      value: formatNumber(stats.totalUsers),
      label: t('stats.activeUsers'),
      description: t('stats.usersDesc'),
      color: 'blue'
    },
    {
      icon: <Bus className="h-8 w-8 text-green-600" />,
      value: formatNumber(stats.activeBuses),
      label: t('stats.busesTracked'),
      description: t('stats.busesDesc'),
      color: 'green'
    },
    {
      icon: <MapPin className="h-8 w-8 text-purple-600" />,
      value: stats.routesCovered,
      label: t('stats.routesCovered'),
      description: t('stats.routesDesc'),
      color: 'purple'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      value: formatNumber(stats.tripsCompleted),
      label: t('stats.tripsCompleted'),
      description: t('stats.tripsDesc'),
      color: 'orange'
    }
  ];

  const additionalStats = [
    {
      icon: <Clock className="h-6 w-6 text-red-600" />,
      value: formatNumber(stats.timesSaved),
      label: t('stats.hoursSaved'),
      description: t('stats.hoursSavedDesc')
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      value: stats.citiesCovered,
      label: t('stats.citiesActive'),
      description: t('stats.citiesActiveDesc')
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      value: '4.8/5',
      label: t('stats.userRating'),
      description: t('stats.userRatingDesc')
    },
    {
      icon: <MapPin className="h-6 w-6 text-pink-600" />,
      value: '99.9%',
      label: t('stats.uptime'),
      description: t('stats.uptimeDesc')
    }
  ];

  const achievements = [
    {
      title: t('stats.achievements.bestAppTitle'),
      organization: t('stats.achievements.bestAppOrg'),
      description: t('stats.achievements.bestAppDesc')
    },
    {
      title: t('stats.achievements.smartCityTitle'),
      organization: t('stats.achievements.smartCityOrg'),
      description: t('stats.achievements.smartCityDesc')
    },
    {
      title: t('stats.achievements.userChoiceTitle'),
      organization: t('stats.achievements.userChoiceOrg'),
      description: t('stats.achievements.userChoiceDesc')
    }
  ];

  const impactMetrics = [
    {
      metric: t('stats.impact.carbonFootprint'),
      value: '2,500 tons CO2',
      description: t('stats.impact.carbonFootprintDesc')
    },
    {
      metric: t('stats.impact.avgWaitTime'),
      value: '8.5 minutes',
      description: t('stats.impact.avgWaitTimeDesc')
    },
    {
      metric: t('stats.impact.userSatisfaction'),
      value: '94%',
      description: t('stats.impact.userSatisfactionDesc')
    }
  ];

  return (
    <section id="stats" className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t('stats.title')}</h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">{t('stats.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mainStats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-xl p-8 text-center hover:from-white/25 hover:to-white/10 transition-all duration-300 border border-white/20 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg font-semibold mb-2">{stat.label}</div>
              <div className="text-sm text-purple-100">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {additionalStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-purple-100">{stat.description}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-8 mb-16 border border-white/20 shadow-xl">
          <h3 className="text-2xl font-bold text-center mb-8">{t('stats.liveActivityFeed')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">{(stats.activeBuses / 10).toFixed(0)}/min</div>
              <div className="text-purple-100">{t('stats.busesDeparting')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">{(stats.totalUsers / 100).toFixed(0)}/hr</div>
              <div className="text-purple-100">{t('stats.newAppOpens')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400 mb-2">{(stats.routesCovered / 12).toFixed(0)}/min</div>
              <div className="text-purple-100">{t('stats.routesQueried')}</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">{t('stats.recognitionAchievements')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-400/20 to-yellow-500/20 backdrop-blur-md rounded-lg p-6 text-center border border-amber-300/30 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h4 className="text-lg font-semibold mb-2">{achievement.title}</h4>
                <div className="text-amber-300 font-medium mb-3">{achievement.organization}</div>
                <p className="text-sm text-amber-100">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-xl p-8 border border-emerald-300/30 shadow-xl">
          <h3 className="text-2xl font-bold text-center mb-8">{t('stats.environmentalSocialImpact')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactMetrics.map((impact, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-2">{impact.value}</div>
                <div className="text-lg font-semibold mb-2">{impact.metric}</div>
                <div className="text-sm text-emerald-100">{impact.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">{t('stats.growingEveryDay')}</h3>
          <p className="text-purple-100 mb-8 max-w-2xl mx-auto">{t('stats.growingEveryDayDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105">
              {t('stats.joinCommunity')}
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-white hover:to-purple-100 hover:text-purple-900 transition-all shadow-lg">
              {t('stats.viewDetailedAnalytics')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
