// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, RefreshCw, CheckCircle, Truck, Package, Eye } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminExchangePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('exchange');
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  useEffect(() => {
    fetchExchanges();
  }, []);
  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 50,
          pageNumber: 1,
          orderBy: [{
            exchangeTime: 'desc'
          }]
        }
      });
      if (result && result.records) {
        setExchanges(result.records);
      } else {
        setExchanges([]);
      }
    } catch (error) {
      console.error('获取兑换数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取兑换记录",
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
  const handleApprove = async exchange => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已审核'
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: exchange._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: "审核通过",
        description: `已审核通过兑换申请`
      });
      fetchExchanges();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const handleShip = async exchange => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'points_exchange',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已发货',
            shippingTime: Date.now(),
            trackingNumber: 'YT' + Date.now().toString().slice(-8)
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: exchange._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: "发货成功",
        description: `已更新发货信息`
      });
      fetchExchanges();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const handleViewDetails = exchange => {
    toast({
      title: "查看详情",
      description: `查看兑换申请详情`
    });
  };
  const getStatusBadge = status => {
    const statusConfig = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800',
        label: '待审核'
      },
      'approved': {
        color: 'bg-blue-100 text-blue-800',
        label: '已审核'
      },
      'shipped': {
        color: 'bg-green-100 text-green-800',
        label: '已发货'
      },
      'delivered': {
        color: 'bg-purple-100 text-purple-800',
        label: '已收货'
      },
      'rejected': {
        color: 'bg-red-100 text-red-800',
        label: '已拒绝'
      }
    };
    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      label: status || '未知'
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };
  const filteredExchanges = exchanges.filter(exchange => {
    const matchesSearch = exchange.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || exchange.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exchange.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">积分兑换管理</h1>
            <p className="text-gray-600">审核和管理积分兑换申请</p>
          </div>
          <Button variant="outline" onClick={fetchExchanges}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索商品或收货人..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已审核</option>
                <option value="shipped">已发货</option>
                <option value="delivered">已收货</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 兑换表格 */}
        <Card>
          <CardHeader>
            <CardTitle>兑换申请列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-gray-600">加载中...</p>
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请ID</TableHead>
                      <TableHead>商品名称</TableHead>
                      <TableHead>消耗积分</TableHead>
                      <TableHead>收货人</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExchanges.map(exchange => <TableRow key={exchange._id}>
                        <TableCell className="font-mono text-sm">{exchange._id?.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{exchange.productName}</TableCell>
                        <TableCell>{exchange.pointsCost}</TableCell>
                        <TableCell>{exchange.recipientName}</TableCell>
                        <TableCell>{exchange.exchangeTime ? new Date(exchange.exchangeTime).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{getStatusBadge(exchange.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(exchange)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {exchange.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleApprove(exchange)}>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>}
                            {exchange.status === 'approved' && <Button variant="ghost" size="sm" onClick={() => handleShip(exchange)}>
                                <Truck className="w-4 h-4 text-blue-600" />
                              </Button>}
                            {exchange.status === 'shipped' && <Button variant="ghost" size="sm">
                                <Package className="w-4 h-4 text-purple-600" />
                              </Button>}
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>

                {filteredExchanges.length === 0 && exchanges.length > 0 && <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无相关兑换申请</p>
                  </div>}

                {exchanges.length === 0 && <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无兑换数据</p>
                  </div>}
              </div>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}