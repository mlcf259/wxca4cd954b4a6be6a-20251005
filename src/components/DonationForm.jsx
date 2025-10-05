// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Input, Button } from '@/components/ui';
// @ts-ignore;
import { Plus } from 'lucide-react';

export function DonationForm({
  onDonate
}) {
  const [formData, setFormData] = useState({
    donorName: '',
    donorContact: '',
    donationType: 'money',
    amount: '',
    itemName: '',
    itemValue: '',
    purpose: '环保活动经费'
  });
  const handleSubmit = e => {
    e.preventDefault();
    onDonate(formData);
    setFormData({
      donorName: '',
      donorContact: '',
      donationType: 'money',
      amount: '',
      itemName: '',
      itemValue: '',
      purpose: '环保活动经费'
    });
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">捐赠类型</label>
        <select value={formData.donationType} onChange={e => handleInputChange('donationType', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <option value="money">资金捐赠</option>
          <option value="material">物资捐赠</option>
        </select>
      </div>

      {formData.donationType === 'money' ? <div>
          <label className="block text-sm font-medium mb-2">捐赠金额（元）</label>
          <Input type="number" placeholder="请输入捐赠金额" value={formData.amount} onChange={e => handleInputChange('amount', e.target.value)} className="text-lg" required />
        </div> : <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">物品名称</label>
            <Input placeholder="请输入物品名称" value={formData.itemName} onChange={e => handleInputChange('itemName', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">物品价值（元）</label>
            <Input type="number" placeholder="请输入物品价值" value={formData.itemValue} onChange={e => handleInputChange('itemValue', e.target.value)} required />
          </div>
        </div>}

      <div>
        <label className="block text-sm font-medium mb-2">捐赠用途</label>
        <select value={formData.purpose} onChange={e => handleInputChange('purpose', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
          <option value="环保活动经费">环保活动经费</option>
          <option value="敬老院物资">敬老院物资</option>
          <option value="儿童教育">儿童教育</option>
          <option value="紧急救灾">紧急救灾</option>
          <option value="其他用途">其他用途</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">捐赠人姓名</label>
        <Input placeholder="请输入您的姓名" value={formData.donorName} onChange={e => handleInputChange('donorName', e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">联系方式</label>
        <Input placeholder="请输入手机号码" value={formData.donorContact} onChange={e => handleInputChange('donorContact', e.target.value)} required />
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        <Plus className="w-4 h-4 mr-2" />
        确认捐赠
      </Button>
    </form>;
}