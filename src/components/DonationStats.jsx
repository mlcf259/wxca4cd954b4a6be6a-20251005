// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function DonationStats({
  totalDonations,
  totalMaterials
}) {
  const totalAmount = totalDonations + totalMaterials;
  return <div className="bg-green-600 text-white p-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold">¥</span>
        </div>
        <p className="text-3xl font-bold">{totalAmount.toLocaleString()}</p>
        <p className="text-green-100">累计捐赠总额（元）</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-700 rounded-lg">
          <p className="text-2xl font-bold">{totalDonations.toLocaleString()}</p>
          <p className="text-green-100 text-sm">资金捐赠</p>
        </div>
        <div className="text-center p-3 bg-green-700 rounded-lg">
          <p className="text-2xl font-bold">{totalMaterials.toLocaleString()}</p>
          <p className="text-green-100 text-sm">物资捐赠</p>
        </div>
      </div>
    </div>;
}