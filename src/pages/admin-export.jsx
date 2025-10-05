// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, FileText, FileSpreadsheet, Filter, Calendar, Users, Activity, Coins, Heart, History } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
import { ExportHistory } from '@/components/ExportHistory';
import { DateRangeFilter } from '@/components/DateRangeFilter';
export default function AdminExportPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('export');
  const [dataType, setDataType] = useState('activity');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [statusFilter, setStatusFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('excel');
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const [filters, setFilters] = useState({
    activity: {
      dateRange: 'thisMonth',
      status: 'all'
    },
    volunteer: {
      dateRange: 'thisMonth',
      status: 'all'
    },
    points: {
      dateRange: 'thisMonth',
      type: 'all',
      status: 'all'
    },
    donation: {
      dateRange: 'thisMonth',
      type: 'all',
      status: 'all'
    }
  });
  useEffect(() => {
    loadExportHistory();
  }, []);
  const loadExportHistory = async () => {
    // 模拟导出历史数据
    const mockHistory = [{
      id: '1',
      dataType: 'activity',
      format: 'excel',
      recordCount: 45,
      exportTime: Date.now() - 86400000,
      status: 'completed',
      filters: {
        dateRange: 'thisMonth',
        status: 'all'
      }
    }, {
      id: '2',
      dataType: 'points',
      format: 'csv',
      recordCount: 128,
      exportTime: Date.now() - 172800000,
      status: 'completed',
      filters: {
        dateRange: 'lastMonth',
        type: 'earned',
        status: 'all'
      }
    }, {
      id: '3',
      dataType: 'donation',
      format: 'excel',
      recordCount: 23,
      exportTime: Date.now() - 259200000,
      status: 'completed',
      filters: {
        dateRange: 'thisQuarter',
        type: 'money',
        status: 'completed'
      }
    }];
    setExportHistory(mockHistory);
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
  const handleExport = async () => {
    try {
      setExporting(true);

      // 构建筛选条件
      const filterConditions = {
        dataType,
        format: exportFormat,
        filters: filters[dataType],
        dateRange: filters[dataType].dateRange,
        status: filters[dataType].status
      };

      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 添加到历史记录
      const newExport = {
        id: Date.now().toString(),
        dataType,
        format: exportFormat,
        recordCount: Math.floor(Math.random() * 100) + 50,
        exportTime: Date.now(),
        status: 'completed',
        filters: filters[dataType]
      };
      setExportHistory(prev => [newExport, ...prev]);
      toast({
        title: "导出成功",
        description: `已成功导出${getDataTypeLabel(dataType)}数据`
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };
  const handleReexport = exportItem => {
    setDataType(exportItem.dataType);
    setExportFormat(exportItem.format);
    setFilters(prev => ({
      ...prev,
      [exportItem.dataType]: exportItem.filters
    }));
    toast({
      title: "已应用筛选条件",
      description: "请点击导出按钮开始导出"
    });
  };
  const updateFilter = (type, field, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };
  const getDataTypeLabel = type => {
    const labels = {
      activity: '活动数据',
      volunteer: '志愿者数据',
      points: '积分记录',
      donation: '捐赠记录'
    };
    return labels[type] || type;
  };
  const getDataTypeIcon = type => {
    const icons = {
      activity: Activity,
      volunteer: Users,
      points: Coins,
      donation: Heart
    };
    return icons[type] || FileText;
  };
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据导出</h1>
            <p className="text-gray-600">导出系统数据为Excel或CSV格式</p>
          </div>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              数据导出
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              导出历史
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 数据类型选择 */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>数据类型</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['activity', 'volunteer', 'points', 'donation'].map(type => {
                    const Icon = getDataTypeIcon(type);
                    return <button key={type} onClick={() => setDataType(type)} className={`w-full p-3 rounded-lg text-left flex items-center space-x-3 ${dataType === type ? 'bg-blue-50 border border-blue-200' : 'border border-gray-200 hover:bg-gray-50'}`}>
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{getDataTypeLabel(type)}</span>
                          {dataType === type && <Badge className="ml-auto bg-blue-100 text-blue-800">已选</Badge>}
                        </button>;
                  })}
                  </div>
                </CardContent>
              </Card>

              {/* 筛选条件和导出操作 */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-600" />
                    {getDataTypeLabel(dataType)} - 筛选条件
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 时间范围筛选 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">时间范围</label>
                      <DateRangeFilter value={filters[dataType].dateRange} onChange={value => updateFilter(dataType, 'dateRange', value)} />
                    </div>

                    {/* 数据类型特定筛选 */}
                    {dataType === 'activity' && <div>
                        <label className="block text-sm font-medium mb-2">活动状态</label>
                        <Select value={filters.activity.status} onValueChange={value => updateFilter('activity', 'status', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="upcoming">未开始</SelectItem>
                            <SelectItem value="ongoing">进行中</SelectItem>
                            <SelectItem value="completed">已结束</SelectItem>
                            <SelectItem value="cancelled">已取消</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>}

                    {dataType === 'points' && <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">积分类型</label>
                          <Select value={filters.points.type} onValueChange={value => updateFilter('points', 'type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部类型</SelectItem>
                              <SelectItem value="earned">获得积分</SelectItem>
                              <SelectItem value="spent">消耗积分</SelectItem>
                              <SelectItem value="exchange">积分兑换</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">积分状态</label>
                          <Select value={filters.points.status} onValueChange={value => updateFilter('points', 'status', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部状态</SelectItem>
                              <SelectItem value="active">已生效</SelectItem>
                              <SelectItem value="pending">处理中</SelectItem>
                              <SelectItem value="expired">已过期</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>}

                    {dataType === 'donation' && <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">捐赠类型</label>
                          <Select value={filters.donation.type} onValueChange={value => updateFilter('donation', 'type', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部类型</SelectItem>
                              <SelectItem value="money">资金捐赠</SelectItem>
                              <SelectItem value="material">物资捐赠</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">捐赠状态</label>
                          <Select value={filters.donation.status} onValueChange={value => updateFilter('donation', 'status', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择状态" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">全部状态</SelectItem>
                              <SelectItem value="completed">已完成</SelectItem>
                              <SelectItem value="processing">处理中</SelectItem>
                              <SelectItem value="pending">待确认</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>}

                    {dataType === 'volunteer' && <div>
                        <label className="block text-sm font-medium mb-2">志愿者状态</label>
                        <Select value={filters.volunteer.status} onValueChange={value => updateFilter('volunteer', 'status', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="active">活跃</SelectItem>
                            <SelectItem value="inactive">非活跃</SelectItem>
                            <SelectItem value="new">新注册</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>}

                    {/* 导出格式选择 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">导出格式</label>
                      <div className="flex space-x-4">
                        <button onClick={() => setExportFormat('excel')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${exportFormat === 'excel' ? 'bg-green-100 border border-green-300' : 'border border-gray-300 hover:bg-gray-50'}`}>
                          <FileSpreadsheet className="w-5 h-5 text-green-600" />
                          <span>Excel (.xlsx)</span>
                        </button>
                        <button onClick={() => setExportFormat('csv')} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${exportFormat === 'csv' ? 'bg-blue-100 border border-blue-300' : 'border border-gray-300 hover:bg-gray-50'}`}>
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span>CSV (.csv)</span>
                        </button>
                      </div>
                    </div>

                    {/* 导出按钮 */}
                    <div className="pt-4 border-t">
                      <Button onClick={handleExport} disabled={exporting} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        {exporting ? '导出中...' : `导出${getDataTypeLabel(dataType)}`}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ExportHistory exports={exportHistory} onReexport={handleReexport} onRefresh={loadExportHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>;
}