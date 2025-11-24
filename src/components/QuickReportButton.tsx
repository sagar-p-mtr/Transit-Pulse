import React, { useState } from 'react';
import { community } from '../services/enhancedApi';
import { AlertTriangle, Clock, Users as UsersIcon, XCircle, CheckCircle } from 'lucide-react';

interface Props {
  busId?: string;
  routeId?: string;
}

export default function QuickReportButton({ busId, routeId }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportTypes = [
    { type: 'delay', icon: Clock, label: 'Bus Delayed', color: 'yellow' },
    { type: 'crowded', icon: UsersIcon, label: 'Too Crowded', color: 'orange' },
    { type: 'breakdown', icon: XCircle, label: 'Breakdown', color: 'red' },
    { type: 'accident', icon: AlertTriangle, label: 'Accident', color: 'red' },
  ];

  const handleReport = async (type: string, label: string) => {
    setSubmitting(true);
    const result = await community.postReport(type, label, busId, routeId);
    
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setShowMenu(false);
      }, 2000);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed bottom-24 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
        <CheckCircle className="w-5 h-5" />
        <span>Report Submitted!</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-24 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-all z-50"
        title="Quick Report"
      >
        <AlertTriangle className="w-6 h-6" />
      </button>

      {showMenu && (
        <div className="fixed bottom-40 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-3 space-y-2 z-50 min-w-[200px]">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Report an Issue
          </p>
          {reportTypes.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => handleReport(type, label)}
              disabled={submitting}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Icon className={`w-5 h-5 text-${color}-500`} />
              <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

