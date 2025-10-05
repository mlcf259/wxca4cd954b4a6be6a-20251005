// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Badge, Input } from '@/components/ui';
// @ts-ignore;
import { Users, Activity, Coins, Heart, CheckCircle, XCircle, Bell, QrCode, RefreshCw, Filter, Search, ChevronRight } from 'lucide-react';

import { MobileTabBar } from '@/components/MobileTabBar';
import { MobileStatCard } from '@/components/MobileStatCard';
export default function MobileAdminPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalUsers: 0,
    totalPoints: 0,
    totalDonations: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);

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

      // 获取积分统计（从积分记录汇总）
      const pointsResult = await $w.cloud.callDataSource({
        dataSourceName: 'points_record',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 1000
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

      // 获取待审核事项
      const pendingExchanges = await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                status: {
                  $eq: 'pending'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 10
        }
      });
      setStats({
        totalActivities: activitiesResult?.total || 0,
        totalUsers: usersResult?.total || 0,
        totalPoints: pointsResult?.records?.reduce((sum, record) => sum + (record.points || 0), 0) || 0,
        totalDonations: donationsResult?.total || 0
      });
      setPendingApprovals(pendingExchanges?.records || []);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (itemId, type) => {
    try {
      let methodName, dataSourceName, data;
      if (type === 'exchange') {
        methodName = 'wedaUpdateV2';
        dataSourceName = 'points_exchange';
        data = {
          status: 'approved'
        };
      }
      await $w.cloud.callDataSource({
        dataSourceName,
        methodName,
        params: {
          data,
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: itemId
                }
              }]
            }
          }
        }
      });
      toast({
        title: "审核通过",
        description: "操作成功"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };
  const handleReject = async (itemId, type) => {
    try {
      let methodName, dataSourceName, data;
      if (type === 'exchange') {
        methodName = 'wedaUpdateV2';
        dataSourceName = 'points_exchange';
        data = {
          status: 'rejected'
        };
      }
      await $w.cloud.callDataSource({
        dataSourceName,
        methodName,
        params: {
          data,
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: itemId
                }
              }]
            }
          }
        }
      });
      toast({
        title: "已拒绝",
        description: "操作成功"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };
  const handleScan = () => {
    toast({
      title: "扫码功能",
      description: "调用摄像头进行签到"
    });
  };
  const handleSendMessage = () => {
    $w.utils.navigateTo({
      pageId: 'admin-notifications',
      params: {}
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 pb-16">
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部标题栏 */}
      <div className="bg-white shadow-sm border-b p-4">
        <h1 className="text-xl font-bold text-gray-900">移动管理端</h1>
        <p className="text-sm text-gray-600">随时随地管理公益平台</p>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'dashboard' && <>
            {/* 数据概览 */}
            <div className="grid grid-cols-2 gap-3">
              <MobileStatCard title="活动总数" value={stats.totalActivities} change={8.3} icon={Activity} color="blue" />
              <MobileStatCard title="用户总数" value={stats.totalUsers} change={12.5} icon={Users} color="green" />
              <MobileStatCard title="总积分" value={stats.totalPoints} change={5.7} icon={Coins} color="orange" />
              <MobileStatCard title="捐赠记录" value={stats.totalDonations} change={15.2} icon={Heart} color="purple" />
            </div>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-between" onClick={() => setActiveTab('approval')}>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                    <span>待审核事项</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {pendingApprovals.length}
                  </Badge>
                </Button>
                
                <Button className="w-full justify-between" onClick={handleSendMessage}>
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-green-600" />
                    <span>发送通知</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>

                <Button className="w-full justify-between" onClick={handleScan}>
                  <div className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-purple-600" />
                    <span>扫码签到</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Button>
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近动态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">新用户注册</p>
                      <p className="text-xs text-gray-600">5分钟前</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">+1</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">积分兑换</p>
                      <p className="text-xs text-gray-600">10分钟前</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">完成</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>}

        {activeTab === 'approval' && <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">待审核事项</h2>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="w-4 h-4 mr-1" />
                刷新
              </Button>
            </div>

            {pendingApprovals.length === 0 ? <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <p className="text-gray-600">暂无待审核事项</p>
              </div> : <div className="space-y-3">
                {pendingApprovals.map(item => <Card key={item._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-gray-600">
                            消耗积分: {item.pointsCost}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.exchangeTime).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">待审核</Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApprove(item._id, 'exchange')}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          通过
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReject(item._id, 'exchange')}>
                          <XCircle className="w-4 h-4 mr-1" />
                          拒绝
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </>}

        {activeTab === 'messages' && <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">消息推送</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Bell className="w-5 h-5 mr-2" />
                  发送系统公告
                </Button>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Activity className="w-5 h-5 mr-2" />
                  活动提醒
                </Button>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Coins className="w-5 h-5 mr-2" />
                  积分变动通知
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近消息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">系统维护通知</p>
                    <p className="text-sm text-gray-600">发布于2小时前</p>
                    <Badge className="bg-blue-100 text-blue-800 mt-2">已发送</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>}

        {activeTab === 'scan' && <div className="text-center space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-lg font-semibold mb-2">扫码签到</h2>
              <p className="text-gray-600 mb-4">扫描活动二维码进行签到</p>
              
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleScan}>
                启动摄像头
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近签到</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <p className="text-sm font-medium">社区环保活动</p>
                      <p className="text-xs text-gray-600">今天 09:30</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">成功</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>}

        {activeTab === 'profile' && <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">管理员</h3>
                    <p className="text-sm text-gray-600">super_admin@example.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">操作统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">今日审核</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">今日消息</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">今日签到</span>
                  <span className="font-medium">8</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => $w.utils.navigateTo({
          pageId: 'admin-login',
          params: {}
        })}>
              退出登录
            </Button>
          </div>}
      </div>

      {/* 底部导航栏 */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}