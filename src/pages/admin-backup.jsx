// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@/components/ui';
// @ts-ignore;
import { Database, Clock, History, RefreshCw, Download, Plus, Cloud, HardDrive } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminBackupPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    frequency: 'daily',
    timeOfDay: '02:00',
    collections: [],
    storageType: 'cloud'
  });
  useEffect(() => {
    loadBackupData();
  }, []);
  const loadBackupData = async () => {
    try {
      setLoading(true);

      // 获取备份计划
      const plansResult = await $w.cloud.callDataSource({
        dataSourceName: 'backup_plan',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100
        }
      });

      // 获取备份历史
      const historyResult = await $w.cloud.callDataSource({
        dataSourceName: 'backup_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100,
          orderBy: [{
            backupTime: 'desc'
          }]
        }
      });
      setPlans(plansResult?.records || []);
      setHistory(historyResult?.records || []);
    } catch (error) {
      console.error('加载备份数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取备份数据",
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
  const handleCreatePlan = async () => {
    try {
      if (!newPlan.planName || newPlan.collections.length === 0) {
        toast({
          title: "请填写完整信息",
          variant: "destructive"
        });
        return;
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'backup_plan',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...newPlan,
            status: 'active',
            nextRunTime: calculateNextRunTime(newPlan.frequency, newPlan.timeOfDay)
          }
        }
      });
      toast({
        title: "创建成功",
        description: "备份计划已创建"
      });
      loadBackupData();
      setNewPlan({
        planName: '',
        frequency: 'daily',
        timeOfDay: '02:00',
        collections: [],
        storageType: 'cloud'
      });
    } catch (error) {
      console.error('创建备份计划失败:', error);
      toast({
        title: "创建失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const calculateNextRunTime = (frequency, timeOfDay) => {
    const now = new Date();
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    if (frequency === 'daily') {
      if (now > nextRun) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (frequency === 'weekly') {
      const dayOfWeek = now.getDay();
      nextRun.setDate(nextRun.getDate() + (7 - dayOfWeek) % 7);
    } else if (frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(1);
    }
    return nextRun.getTime();
  };
  const handleRunNow = async planId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'backup_plan',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            nextRunTime: Date.now()
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: planId
                }
              }]
            }
          }
        }
      });
      toast({
        title: "已触发立即运行",
        description: "备份将在后台执行"
      });
      loadBackupData();
    } catch (error) {
      console.error('触发立即运行失败:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const handleRestore = async backupId => {
    try {
      const backup = history.find(b => b._id === backupId);
      if (!backup) return;
      toast({
        title: "数据恢复",
        description: `正在从备份 ${backup.backupName} 恢复数据...`
      });
      // 模拟恢复过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "恢复成功",
        description: "数据已从备份恢复"
      });
    } catch (error) {
      console.error('恢复数据失败:', error);
      toast({
        title: "恢复失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = status => {
    const statusMap = {
      active: {
        color: 'bg-green-100 text-green-800',
        label: '活跃'
      },
      inactive: {
        color: 'bg-gray-100 text-gray-800',
        label: '停用'
      },
      generating: {
        color: 'bg-blue-100 text-blue-800',
        label: '生成中'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        label: '已完成'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        label: '失败'
      }
    };
    const config = statusMap[status] || {
      color: 'bg-gray-100 text-gray-800',
      label: status
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };
  const getFrequencyLabel = frequency => {
    const frequencyMap = {
      daily: '每日',
      weekly: '每周',
      monthly: '每月'
    };
    return frequencyMap[frequency] || frequency;
  };
  const toggleCollection = collection => {
    setNewPlan(prev => ({
      ...prev,
      collections: prev.collections.includes(collection) ? prev.collections.filter(c => c !== collection) : [...prev.collections, collection]
    }));
  };
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据备份</h1>
            <p className="text-gray-600">定时备份和恢复系统数据</p>
          </div>
          <Button onClick={() => loadBackupData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">
              <Clock className="w-4 h-4 mr-2" />
              备份计划
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              备份历史
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* 新建备份计划 */}
            <Card>
              <CardHeader>
                <CardTitle>新建备份计划</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">计划名称</label>
                    <Input value={newPlan.planName} onChange={e => setNewPlan({
                    ...newPlan,
                    planName: e.target.value
                  })} placeholder="例如: 每日数据备份" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">备份频率</label>
                    <Select value={newPlan.frequency} onValueChange={value => setNewPlan({
                    ...newPlan,
                    frequency: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择频率" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">每日</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                        <SelectItem value="monthly">每月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">备份时间</label>
                    <Input type="time" value={newPlan.timeOfDay} onChange={e => setNewPlan({
                    ...newPlan,
                    timeOfDay: e.target.value
                  })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">存储类型</label>
                    <Select value={newPlan.storageType} onValueChange={value => setNewPlan({
                    ...newPlan,
                    storageType: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择存储类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cloud">
                          <div className="flex items-center">
                            <Cloud className="w-4 h-4 mr-2" />
                            云端存储
                          </div>
                        </SelectItem>
                        <SelectItem value="local">
                          <div className="flex items-center">
                            <HardDrive className="w-4 h-4 mr-2" />
                            本地存储
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">备份内容</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['activity', 'user', 'points_record', 'donation_ledger', 'volunteer_registration', 'points_exchange'].map(collection => <Button key={collection} variant={newPlan.collections.includes(collection) ? 'default' : 'outline'} onClick={() => toggleCollection(collection)} className="justify-start">
                        <Database className="w-4 h-4 mr-2" />
                        {{
                      activity: '活动数据',
                      user: '用户数据',
                      points_record: '积分记录',
                      donation_ledger: '捐赠记录',
                      volunteer_registration: '志愿者报名',
                      points_exchange: '积分兑换'
                    }[collection]}
                      </Button>)}
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleCreatePlan} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    创建备份计划
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 备份计划列表 */}
            <Card>
              <CardHeader>
                <CardTitle>备份计划列表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">加载中...</p>
                  </div> : <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>计划名称</TableHead>
                        <TableHead>频率</TableHead>
                        <TableHead>备份内容</TableHead>
                        <TableHead>下次运行</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map(plan => <TableRow key={plan._id}>
                          <TableCell className="font-medium">{plan.planName}</TableCell>
                          <TableCell>{getFrequencyLabel(plan.frequency)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {plan.collections.map(collection => <Badge key={collection} variant="outline" className="text-xs">
                                  {{
                            activity: '活动',
                            user: '用户',
                            points_record: '积分',
                            donation_ledger: '捐赠',
                            volunteer_registration: '报名',
                            points_exchange: '兑换'
                          }[collection]}
                                </Badge>)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {plan.nextRunTime ? new Date(plan.nextRunTime).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRunNow(plan._id)}>
                              立即运行
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>备份历史</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">加载中...</p>
                  </div> : <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>备份名称</TableHead>
                        <TableHead>备份内容</TableHead>
                        <TableHead>备份时间</TableHead>
                        <TableHead>大小</TableHead>
                        <TableHead>存储</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map(backup => <TableRow key={backup._id}>
                          <TableCell className="font-medium">{backup.backupName}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {backup.collections.map(collection => <Badge key={collection} variant="outline" className="text-xs">
                                  {{
                            activity: '活动',
                            user: '用户',
                            points_record: '积分',
                            donation_ledger: '捐赠',
                            volunteer_registration: '报名',
                            points_exchange: '兑换'
                          }[collection]}
                                </Badge>)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(backup.backupTime).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {backup.fileSize ? `${Math.round(backup.fileSize / 1024)} MB` : '-'}
                          </TableCell>
                          <TableCell>
                            {backup.storageType === 'cloud' ? <Badge className="bg-blue-100 text-blue-800">云端</Badge> : <Badge className="bg-gray-100 text-gray-800">本地</Badge>}
                          </TableCell>
                          <TableCell>{getStatusBadge(backup.status)}</TableCell>
                          <TableCell>
                            {backup.status === 'completed' && <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  下载
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRestore(backup._id)}>
                                  恢复
                                </Button>
                              </div>}
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>;
}