// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Gift, Activity, Heart, TrendingUp, BarChart3 } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
import { StatCard } from '@/components/StatCard';
export default function AdminDashboardPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalDonations: 0,
    totalExchanges: 0
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 获取用户统计
      const usersResult = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      // 获取活动统计
      const activitiesResult = await $w.cloud.callDataSource({
        dataSourceName: 'activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      // 获取捐赠统计
      const donationsResult = await $w.cloud.callDataSource({
        dataSourceName: 'donation_ledger',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      // 获取兑换统计
      const exchangesResult = await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      setStats({
        totalUsers: usersResult?.total || 0,
        totalActivities: activitiesResult?.total || 0,
        totalDonations: donationsResult?.total || 0,
        totalExchanges: exchangesResult?.total || 0
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取统计信息",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    $w.utils.navigateTo({
      pageId: 'admin-login',
      params: {}
    });
  };
  const handleTabChange = tab => {
    $w.utils.navigateTo({
      pageId: `admin-${tab}`,
      params: {}
    });
  };
  if (loading) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-600">加载统计数据...</p>
          </div>
        </div>
      </AdminLayout>;
  }
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="总用户数" value={stats.totalUsers} change={12.5} icon={Users} color="blue" />
          <StatCard title="活动总数" value={stats.totalActivities} change={8.3} icon={Activity} color="green" />
          <StatCard title="捐赠记录" value={stats.totalDonations} change={15.2} icon={Heart} color="purple" />
          <StatCard title="积分兑换" value={stats.totalExchanges} change={5.7} icon={Gift} color="orange" />
        </div>

        {/* 数据概览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                用户增长趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">用户增长图表</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                活动参与统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">活动参与图表</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleTabChange('users')}>
                <Users className="w-4 h-4 mr-2" />
                用户管理
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleTabChange('exchange')}>
                <Gift className="w-4 h-4 mr-2" />
                兑换审核
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleTabChange('analytics')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                数据分析
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}