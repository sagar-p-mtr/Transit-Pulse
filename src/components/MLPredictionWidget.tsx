import React, { useState } from 'react';
import { mlPredictions } from '../services/enhancedApi';
import { Clock, Users, TrendingUp } from 'lucide-react';

interface Props {
  busId: string;
  stopId: string;
  routeId: string;
}

export default function MLPredictionWidget({ busId, stopId, routeId }: Props) {
  const [etaPrediction, setEtaPrediction] = useState<any>(null);
  const [crowdPrediction, setCrowdPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const [eta, crowd] = await Promise.all([
        mlPredictions.predictETA(busId, stopId),
        mlPredictions.predictCrowd(routeId, stopId)
      ]);
      
      if (eta.success) setEtaPrediction(eta.data);
      if (crowd.success) setCrowdPrediction(crowd.data);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    loadPredictions();
  }, [busId, stopId, routeId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow-md space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">AI Predictions</h3>
      </div>

      {/* ETA Prediction */}
      {etaPrediction && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">Estimated Arrival</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {etaPrediction.eta_minutes} min
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(etaPrediction.confidence * 100)}% confident
            </div>
            {etaPrediction.method === 'ml_model' && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-0.5 rounded">
                AI
              </span>
            )}
          </div>
        </div>
      )}

      {/* Crowd Prediction */}
      {crowdPrediction && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            crowdPrediction.crowd_level === 'Low' ? 'bg-green-100 dark:bg-green-900' :
            crowdPrediction.crowd_level === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
            'bg-red-100 dark:bg-red-900'
          }`}>
            <Users className={`w-5 h-5 ${
              crowdPrediction.crowd_level === 'Low' ? 'text-green-600 dark:text-green-300' :
              crowdPrediction.crowd_level === 'Medium' ? 'text-yellow-600 dark:text-yellow-300' :
              'text-red-600 dark:text-red-300'
            }`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">Crowd Level</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {crowdPrediction.crowd_level}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {crowdPrediction.crowd_percentage}%
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        🤖 Powered by Machine Learning
      </p>
    </div>
  );
}

