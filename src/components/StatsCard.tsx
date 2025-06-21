import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'warning' | 'success' | 'error';
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, change }) => {
  const getColorClasses = () => {
    const colors = {
      primary: 'bg-primary-50 text-primary-600 border-primary-200',
      secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
      accent: 'bg-accent-50 text-accent-600 border-accent-200',
      warning: 'bg-warning-50 text-warning-600 border-warning-200',
      success: 'bg-success-50 text-success-600 border-success-200',
      error: 'bg-error-50 text-error-600 border-error-200',
    };
    return colors[color];
  };

  const getIconBgColor = () => {
    const colors = {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      accent: 'bg-accent-600',
      warning: 'bg-warning-600',
      success: 'bg-success-600',
      error: 'bg-error-600',
    };
    return colors[color];
  };

  const getTrendColor = () => {
    if (!change) return '';
    const colors = {
      up: 'text-success-600',
      down: 'text-error-600',
      neutral: 'text-gray-500',
    };
    return colors[change.trend];
  };

  return (
    <div className={`bg-white rounded-xl border ${getColorClasses()} p-6 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${getTrendColor()}`}>
              {change.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getIconBgColor()} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;