// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Gift, ShoppingCart, Coins, History, Loader } from 'lucide-react';

export default function IntegralPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('mall');
  const [userPoints, setUserPoints] = useState(0);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = $w.auth.currentUser;
  useEffect(() => {
    if (user && user.userId) {
      fetchPointsData();
    } else {
      setLoading(false);
    }
  }, [user]);
  const fetchPointsData = async () => {
    try {
      setLoading(true);
      setError(null);
      // 获取用户积分记录
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'points_record',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                userId: {
                  $eq: user.userId
                }
              }, {
                status: {
                  $eq: '已生效'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 50,
          pageNumber: 1,
          orderBy: [{
            recordTime: 'desc'
          }]
        }
      });
      if (result && result.records) {
        // 计算总积分
        const total = result.records.reduce((sum, record) => {
          if (record.pointsValue && record.status === '已生效') {
            return sum + (record.pointsValue || 0);
          }
          return sum;
        }, 0);
        setUserPoints(total);
        // 设置兑换历史（筛选积分类型为兑换的记录）
        const exchangeRecords = result.records.filter(record => record.pointsType === '积分兑换' && record.pointsValue < 0).map(record => ({
          id: record._id,
          product: record.description?.replace('兑换:', '') || '未知商品',
          points: Math.abs(record.pointsValue || 0),
          date: new Date(record.recordTime).toLocaleDateString(),
          status: record.status || '已完成'
        }));
        setExchangeHistory(exchangeRecords);
      } else {
        setUserPoints(0);
        setExchangeHistory([]);
      }
    } catch (err) {
      console.error('获取积分数据失败:', err);
      setError('获取积分数据失败，请稍后重试');
      toast({
        title: "数据加载失败",
        description: "无法获取积分数据，请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const products = [{
    id: 1,
    name: '环保水杯',
    points: 200,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    stock: 15,
    description: '可重复使用环保水杯'
  }, {
    id: 2,
    name: '定制T恤',
    points: 300,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    stock: 8,
    description: '志愿者专属定制T恤'
  }, {
    id: 3,
    name: '环保袋',
    points: 100,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    stock: 25,
    description: '可重复使用购物袋'
  }, {
    id: 4,
    name: '书籍套装',
    points: 500,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
    stock: 5,
    description: '环保主题书籍套装'
  }];
  const handleExchange = async product => {
    if (!user || !user.userId) {
      toast({
        title: "请先登录",
        description: "需要登录后才能兑换积分",
        variant: "destructive"
      });
      return;
    }
    if (userPoints >= product.points) {
      try {
        // 创建积分兑换记录（负值表示消耗积分）
        await $w.cloud.callDataSource({
          dataSourceName: 'points_record',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              userId: user.userId,
              pointsType: '积分兑换',
              pointsValue: -product.points,
              recordTime: Date.now(),
              description: `兑换: ${product.name}`,
              status: '已完成'
            }
          }
        });
        toast({
          title: "兑换成功",
          description: `成功兑换 ${product.name}`
        });
        // 刷新积分数据
        await fetchPointsData();
      } catch (error) {
        console.error('兑换失败:', error);
        toast({
          title: "兑换失败",
          description: "请稍后重试",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "积分不足",
        description: "当前积分不足以兑换该商品",
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
          <Button onClick={fetchPointsData} className="bg-green-600 hover:bg-green-700">
            重试
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* 积分概览 */}
      <div className="bg-green-600 text-white p-6">
        <div className="text-center">
          <Coins className="w-12 h-12 mx-auto mb-2" />
          <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
          <p className="text-green-100">当前公益积分</p>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white p-4 sticky top-0 z-10">
        <div className="flex space-x-2">
          <Button variant={activeTab === 'mall' ? 'default' : 'outline'} onClick={() => setActiveTab('mall')} className="flex-1 bg-green-600 text-white">
            <Gift className="w-4 h-4 mr-2" />
            积分商城
          </Button>
          <Button variant={activeTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveTab('history')} className="flex-1">
            <History className="w-4 h-4 mr-2" />
            兑换记录
          </Button>
        </div>
      </div>

      {activeTab === 'mall' && <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => <Card key={product.id} className="overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">{product.points}积分</span>
                    <span className="text-sm text-gray-500">库存: {product.stock}</span>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleExchange(product)} disabled={userPoints < product.points}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    立即兑换
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>}

      {activeTab === 'history' && <div className="p-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {exchangeHistory.map(item => <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.product}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-600 font-semibold">-{item.points}积分</p>
                        <p className="text-sm text-gray-500">{item.status}</p>
                      </div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {exchangeHistory.length === 0 && <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无兑换记录</p>
            </div>}
        </div>}

      {/* 积分规则 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>积分规则</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 参与活动签到：+50积分</p>
              <p>• 完成志愿服务：+80积分</p>
              <p>• 邀请好友参与：+30积分/人</p>
              <p>• 捐赠物资：根据价值获得相应积分</p>
              <p>• 积分有效期为2年</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}