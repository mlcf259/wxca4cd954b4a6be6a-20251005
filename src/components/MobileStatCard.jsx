// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function MobileStatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };
  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };
  return <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {change && <p className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${textColorClasses[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>;
}