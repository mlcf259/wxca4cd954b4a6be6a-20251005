// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { User, Calendar } from 'lucide-react';

export function DonationRecord({
  record,
  type = 'money'
}) {
  const isMoney = type === 'money';
  const amountColor = isMoney ? 'text-green-600' : 'text-blue-600';
  const iconColor = isMoney ? 'text-green-600' : 'text-blue-600';
  return <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <User className="w-4 h-4 mr-2 text-gray-500" />
          <span className="font-medium">{record.donorName}</span>
        </div>
        <p className="text-sm text-gray-500">{record.purpose}</p>
        {!isMoney && <p className="text-sm text-gray-500">{record.itemName}</p>}
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${amountColor}`}>
          ¥{record.amount || record.itemValue}
        </p>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(record.donationTime).toLocaleDateString()}
        </div>
        <p className={`text-xs ${record.status === '已到账' || record.status === '已接收' || record.status === '已分发' ? 'text-green-600' : 'text-blue-600'}`}>
          {record.status}
        </p>
      </div>
    </div>;
}