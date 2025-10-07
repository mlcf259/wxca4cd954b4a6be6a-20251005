// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, DollarSign, Loader } from 'lucide-react';

import { DonationStats } from '@/components/DonationStats';
import { DonationRecord } from '@/components/DonationRecord';
import { DonationForm } from '@/components/DonationForm';
export default function DonationPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [donations, setDonations] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = $w.auth.currentUser;
  useEffect(() => {
    fetchDonationData();
  }, []);
  const fetchDonationData = async () => {
    try {
      setLoading(true);
      setError(null);
      // 获取公开的捐赠记录 - 简化查询条件
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'donation_ledger',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 50,
          orderBy: [{
            donationTime: 'desc'
          }]
        }
      });
      if (result && result.records) {
        // 分离资金捐赠和物资捐赠
        const moneyDonations = result.records.filter(record => record.donationType === 'money');
        const materialDonations = result.records.filter(record => record.donationType === 'material');
        setDonations(moneyDonations);
        setMaterials(materialDonations);
      } else {
        setDonations([]);
        setMaterials([]);
      }
    } catch (err) {
      console.error('获取捐赠数据失败:', err);
      setError('获取捐赠数据失败，请稍后重试');
      toast({
        title: "数据加载失败",
        description: "无法获取捐赠数据，请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const totalDonations = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  const totalMaterials = materials.reduce((sum, material) => sum + (material.itemValue || 0), 0);
  const filteredDonations = donations.filter(donation => donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) || donation.purpose?.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleDonate = async formData => {
    try {
      if (formData.donationType === 'money' && !formData.amount || formData.donationType === 'material' && (!formData.itemName || !formData.itemValue)) {
        toast({
          title: "请填写完整信息",
          description: "请填写所有必填字段",
          variant: "destructive"
        });
        return;
      }
      const donationData = {
        donorName: formData.donorName,
        donorContact: formData.donorContact,
        donationType: formData.donationType,
        purpose: formData.purpose,
        donationTime: Date.now(),
        status: formData.donationType === 'money' ? '处理中' : '待接收',
        isPublic: true,
        notes: '通过小程序捐赠'
      };
      if (formData.donationType === 'money') {
        donationData.amount = parseFloat(formData.amount);
      } else {
        donationData.itemName = formData.itemName;
        donationData.itemValue = parseFloat(formData.itemValue);
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'donation_ledger',
        methodName: 'wedaCreateV2',
        params: {
          data: donationData
        }
      });
      if (result && result.id) {
        toast({
          title: "捐赠成功",
          description: `感谢 ${formData.donorName} 的爱心捐赠！`
        });
        // 刷新捐赠数据
        await fetchDonationData();
      }
    } catch (error) {
      console.error('捐赠失败:', error);
      toast({
        title: "捐赠失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-green-600 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDonationData} className="bg-green-600 hover:bg-green-700">
            重试
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <DonationStats totalDonations={totalDonations} totalMaterials={totalMaterials} />

      <div className="bg-white p-4 sticky top-0 z-10">
        <div className="flex space-x-2 mb-3">
          <Button variant={activeTab === 'ledger' ? 'default' : 'outline'} onClick={() => setActiveTab('ledger')} className="flex-1 bg-green-600 text-white">
            捐赠账本
          </Button>
          <Button variant={activeTab === 'donate' ? 'default' : 'outline'} onClick={() => setActiveTab('donate')} className="flex-1">
            我要捐赠
          </Button>
        </div>

        {activeTab === 'ledger' && <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="搜索捐赠记录..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>}
      </div>

      {activeTab === 'ledger' && <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                资金捐赠记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDonations.map(donation => <DonationRecord key={donation._id} record={donation} type="money" />)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                物资捐赠记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {materials.map(material => <DonationRecord key={material._id} record={material} type="material" />)}
              </div>
            </CardContent>
          </Card>

          {filteredDonations.length === 0 && donations.length > 0 && <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无相关捐赠记录</p>
            </div>}
        </div>}

      {activeTab === 'donate' && <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>我要捐赠</CardTitle>
            </CardHeader>
            <CardContent>
              <DonationForm onDonate={handleDonate} />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>捐赠说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• 所有捐赠将用于公益事业，账目公开透明</p>
                <p>• 资金捐赠将直接用于活动经费和物资采购</p>
                <p>• 物资捐赠请提前联系工作人员确认需求</p>
                <p>• 捐赠记录将在24小时内更新到公开账本</p>
                <p>• 如有疑问，请联系客服：400-123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}