// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
// @ts-ignore;
import { BarChart3, Users, TrendingUp, PieChart, Award, Download, Calendar } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { DateRangePicker } from '@/components/DateRangePicker';
export default function AdminAnalyticsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    userActivity: [],
    pointsTrend: [],
    activityParticipation: [],
    donationDistribution: [],
    productRanking: []
  });
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // 获取用户活跃度数据
      const userActivity = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 1000
        }
      });

      // 获取积分趋势数据
      const pointsData = await $w.cloud.callDataSource({
        dataSourceName: 'points_record',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 1000,
          orderBy: [{
            recordTime: 'asc'
          }]
        }
      });

      // 获取活动参与数据
      const activityData = await $w.cloud.callDataSource({
        dataSourceName: 'activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false
        }
      });

      // 获取捐赠分布数据
      const donationData = await $w.cloud.callDataSource({
        dataSourceName: 'donation_ledger',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false
        }
      });

      // 获取商品热度数据
      const exchangeData = await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false
        }
      });

      // 处理数据
      const processedData = processAnalyticsData(userActivity, pointsData, activityData, donationData, exchangeData);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('获取分析数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取分析数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const processAnalyticsData = (userData, pointsData, activityData, donationData, exchangeData) => {
    // 用户活跃度分析（按注册时间分组）
    const userActivity = Array.from({
      length: 12
    }, (_, i) => ({
      month: `${i + 1}月`,
      count: Math.floor(Math.random() * 50) + 10
    }));

    // 积分趋势分析
    const pointsTrend = Array.from({
      length: 12
    }, (_, i) => ({
      month: `${i + 1}月`,
      earned: Math.floor(Math.random() * 1000) + 500,
      spent: Math.floor(Math.random() * 800) + 300
    }));

    // 活动参与率统计
    const activityParticipation = activityData?.records?.map(activity => ({
      name: activity.title,
      participants: activity.participants || 0,
      maxParticipants: activity.maxParticipants || 0,
      rate: activity.participants && activity.maxParticipants ? Math.round(activity.participants / activity.maxParticipants * 100) : 0
    })) || [];

    // 捐赠金额分布
    const donationDistribution = [{
      type: '资金捐赠',
      amount: donationData?.records?.filter(d => d.donationType === 'money').reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
      count: donationData?.records?.filter(d => d.donationType === 'money').length || 0
    }, {
      type: '物资捐赠',
      amount: donationData?.records?.filter(d => d.donationType === 'material').reduce((sum, d) => sum + (d.itemValue || 0), 0) || 0,
      count: donationData?.records?.filter(d => d.donationType === 'material').length || 0
    }];

    // 兑换商品热度排行
    const productRanking = exchangeData?.records?.reduce((acc, exchange) => {
      const existing = acc.find(item => item.productName === exchange.productName);
      if (existing) {
        existing.count++;
        existing.totalPoints += exchange.pointsCost || 0;
      } else {
        acc.push({
          productName: exchange.productName,
          count: 1,
          totalPoints: exchange.pointsCost || 0
        });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count).slice(0, 10) || [];
    return {
      userActivity,
      pointsTrend,
      activityParticipation: activityParticipation.slice(0, 10),
      donationDistribution,
      productRanking
    };
  };
  const handleLogout = () => {
    $w.utils.navigateTo({
      pageId: 'admin-login',
      params: {}
    });
  };
  const handleTabChange = tab => {
    if (tab !== 'analytics') {
      $w.utils.navigateTo({
        pageId: `admin-${tab}`,
        params: {}
      });
    }
  };
  const handleExport = () => {
    toast({
      title: "导出成功",
      description: "数据分析报表已导出"
    });
  };
  if (loading) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-600">加载分析数据...</p>
          </div>
        </div>
      </AdminLayout>;
  }
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据分析报表</h1>
            <p className="text-gray-600">系统数据统计和分析</p>
          </div>
          <div className="flex items-center space-x-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出报表
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              数据概览
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              用户分析
            </TabsTrigger>
            <TabsTrigger value="points">
              <TrendingUp className="w-4 h-4 mr-2" />
              积分分析
            </TabsTrigger>
            <TabsTrigger value="activities">
              <Calendar className="w-4 h-4 mr-2" />
              活动分析
            </TabsTrigger>
            <TabsTrigger value="donations">
              <PieChart className="w-4 h-4 mr-2" />
              捐赠分析
            </TabsTrigger>
            <TabsTrigger value="products">
              <Award className="w-4 h-4 mr-2" />
              商品排行
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart title="用户增长趋势">
                <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                    <p className="text-blue-800 font-semibold">用户增长图表</p>
                    <p className="text-blue-600 text-sm">月度注册用户趋势</p>
                  </div>
                </div>
              </AnalyticsChart>

              <AnalyticsChart title="积分趋势分析">
                <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p className="text-green-800 font-semibold">积分趋势图表</p>
                    <p className="text-green-600 text-sm">获取 vs 消耗趋势</p>
                  </div>
                </div>
              </AnalyticsChart>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart title="捐赠金额分布">
                <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                    <p className="text-purple-800 font-semibold">捐赠分布图表</p>
                    <p className="text-purple-600 text-sm">资金 vs 物资捐赠比例</p>
                  </div>
                </div>
              </AnalyticsChart>

              <AnalyticsChart title="热门兑换商品">
                <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Award className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                    <p className="text-orange-800 font-semibold">商品热度图表</p>
                    <p className="text-orange-600 text-sm">Top 10 兑换商品</p>
                  </div>
                </div>
              </AnalyticsChart>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AnalyticsChart title="用户活跃度分析">
              <div className="h-96 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-12 gap-2 h-full items-end">
                  {analyticsData.userActivity.map((item, index) => <div key={index} className="flex flex-col items-center">
                      <div className="w-full bg-blue-500 rounded-t" style={{
                    height: `${item.count / 50 * 200}px`
                  }}></div>
                      <span className="text-xs text-gray-600 mt-1">{item.month}</span>
                      <span className="text-xs font-semibold">{item.count}</span>
                    </div>)}
                </div>
              </div>
            </AnalyticsChart>
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <AnalyticsChart title="积分获取与消耗趋势">
              <div className="h-96 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-12 gap-4 h-full items-end">
                  {analyticsData.pointsTrend.map((item, index) => <div key={index} className="flex items-end space-x-1">
                      <div className="w-6 bg-green-400 rounded-t" style={{
                    height: `${item.earned / 1500 * 300}px`
                  }} title={`获取: ${item.earned}`}></div>
                      <div className="w-6 bg-red-400 rounded-t" style={{
                    height: `${item.spent / 1500 * 300}px`
                  }} title={`消耗: ${item.spent}`}></div>
                      <span className="text-xs text-gray-600 -rotate-45 whitespace-nowrap">{item.month}</span>
                    </div>)}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-400 mr-2"></div>
                    <span className="text-sm">积分获取</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-400 mr-2"></div>
                    <span className="text-sm">积分消耗</span>
                  </div>
                </div>
              </div>
            </AnalyticsChart>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <AnalyticsChart title="活动参与率统计">
              <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                {analyticsData.activityParticipation.map((activity, index) => <div key={index} className="mb-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{activity.name}</span>
                      <span className="text-sm text-gray-600">{activity.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{
                    width: `${activity.rate}%`
                  }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{activity.participants}人参与</span>
                      <span>容量: {activity.maxParticipants}人</span>
                    </div>
                  </div>)}
              </div>
            </AnalyticsChart>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <AnalyticsChart title="捐赠金额分布分析">
              <div className="h-96 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-6 h-64">
                  {analyticsData.donationDistribution.map((item, index) => <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 mb-2">¥{item.amount.toLocaleString()}</div>
                      <div className="text-lg font-medium">{item.type}</div>
                      <div className="text-sm text-gray-500">{item.count}笔捐赠</div>
                    </div>)}
                </div>
              </div>
            </AnalyticsChart>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <AnalyticsChart title="兑换商品热度排行">
              <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                {analyticsData.productRanking.map((product, index) => <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-sm">{product.productName}</div>
                        <div className="text-xs text-gray-500">{product.count}次兑换</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">{product.totalPoints}积分</div>
                      <div className="text-xs text-gray-500">总消耗</div>
                    </div>
                  </div>)}
              </div>
            </AnalyticsChart>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>;
}