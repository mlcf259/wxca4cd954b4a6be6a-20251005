// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, CheckSquare, Bell, QrCode, User } from 'lucide-react';

export function MobileTabBar({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'dashboard',
    label: '概览',
    icon: Home
  }, {
    id: 'approval',
    label: '审核',
    icon: CheckSquare
  }, {
    id: 'messages',
    label: '消息',
    icon: Bell
  }, {
    id: 'scan',
    label: '扫码',
    icon: QrCode
  }, {
    id: 'profile',
    label: '我的',
    icon: User
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
        const Icon = tab.icon;
        return <Button key={tab.id} variant="ghost" className="flex flex-col items-center justify-center h-full w-full rounded-none" onClick={() => onTabChange(tab.id)}>
              <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-xs mt-1 ${activeTab === tab.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </Button>;
      })}
      </div>
    </div>;
}