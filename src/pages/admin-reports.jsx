// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Tabs, TabsList, TabsTrigger, TabsContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@/components/ui';
// @ts-ignore;
import { FileText, Clock, Calendar, Mail, Bell, RefreshCw, Download, Plus } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
import { DateRangePicker } from '@/components/DateRangePicker';
export default function AdminReportsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('schedules');
  const [schedules, setSchedules] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSchedule, setNewSchedule] = useState({
    scheduleName: '',
    frequency: 'daily',
    timeOfDay: '08:00',
    templateId: '',
    recipients: [],
    channels: ['email']
  });
  useEffect(() => {
    loadReportData();
  }, []);
  const loadReportData = async () => {
    try {
      setLoading(true);

      // 获取报表模板
      const templatesResult = await $w.cloud.callDataSource({
        dataSourceName: 'report_template',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100
        }
      });

      // 获取报表计划
      const schedulesResult = await $w.cloud.callDataSource({
        dataSourceName: 'report_schedule',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100
        }
      });

      // 获取报表历史
      const historyResult = await $w.cloud.callDataSource({
        dataSourceName: 'report_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      setTemplates(templatesResult?.records || []);
      setSchedules(schedulesResult?.records || []);
      setHistory(historyResult?.records || []);
    } catch (error) {
      console.error('加载报表数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取报表数据",
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
  const handleCreateSchedule = async () => {
    try {
      if (!newSchedule.scheduleName || !newSchedule.templateId) {
        toast({
          title: "请填写完整信息",
          variant: "destructive"
        });
        return;
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'report_schedule',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...newSchedule,
            status: 'active',
            nextRunTime: calculateNextRunTime(newSchedule.frequency, newSchedule.timeOfDay)
          }
        }
      });
      toast({
        title: "创建成功",
        description: "报表计划已创建"
      });
      loadReportData();
      setNewSchedule({
        scheduleName: '',
        frequency: 'daily',
        timeOfDay: '08:00',
        templateId: '',
        recipients: [],
        channels: ['email']
      });
    } catch (error) {
      console.error('创建报表计划失败:', error);
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
  const handleRunNow = async scheduleId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'report_schedule',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            nextRunTime: Date.now()
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: scheduleId
                }
              }]
            }
          }
        }
      });
      toast({
        title: "已触发立即运行",
        description: "报表将在后台生成"
      });
      loadReportData();
    } catch (error) {
      console.error('触发立即运行失败:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const handleRegenerate = async reportId => {
    try {
      const report = history.find(r => r._id === reportId);
      if (!report) return;
      await $w.cloud.callDataSource({
        dataSourceName: 'report_history',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            reportName: report.reportName + '(重新生成)',
            templateId: report.templateId,
            scheduleId: report.scheduleId,
            periodStart: report.periodStart,
            periodEnd: report.periodEnd,
            fileFormat: report.fileFormat,
            status: 'generating'
          }
        }
      });
      toast({
        title: "已触发重新生成",
        description: "报表将在后台生成"
      });
      loadReportData();
    } catch (error) {
      console.error('重新生成报表失败:', error);
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = status => {
    const statusMap = {
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
      },
      distributed: {
        color: 'bg-purple-100 text-purple-800',
        label: '已分发'
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
  const getTemplateName = templateId => {
    const template = templates.find(t => t._id === templateId);
    return template ? template.templateName : '未知模板';
  };
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">自动化报表</h1>
            <p className="text-gray-600">定时生成和分发系统报表</p>
          </div>
          <Button onClick={() => loadReportData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        <Tabs defaultValue="schedules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedules">
              <Clock className="w-4 h-4 mr-2" />
              报表计划
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="w-4 h-4 mr-2" />
              报表模板
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="w-4 h-4 mr-2" />
              历史报表
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-6">
            {/* 新建报表计划 */}
            <Card>
              <CardHeader>
                <CardTitle>新建报表计划</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">计划名称</label>
                    <Input value={newSchedule.scheduleName} onChange={e => setNewSchedule({
                    ...newSchedule,
                    scheduleName: e.target.value
                  })} placeholder="例如: 每日活动报表" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">频率</label>
                    <Select value={newSchedule.frequency} onValueChange={value => setNewSchedule({
                    ...newSchedule,
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
                    <label className="block text-sm font-medium mb-2">生成时间</label>
                    <Input type="time" value={newSchedule.timeOfDay} onChange={e => setNewSchedule({
                    ...newSchedule,
                    timeOfDay: e.target.value
                  })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">报表模板</label>
                    <Select value={newSchedule.templateId} onValueChange={value => setNewSchedule({
                    ...newSchedule,
                    templateId: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择模板" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(template => <SelectItem key={template._id} value={template._id}>
                            {template.templateName} ({getFrequencyLabel(template.templateType)})
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">分发渠道</label>
                  <div className="flex space-x-4">
                    <Button variant={newSchedule.channels.includes('email') ? 'default' : 'outline'} onClick={() => {
                    const channels = newSchedule.channels.includes('email') ? newSchedule.channels.filter(c => c !== 'email') : [...newSchedule.channels, 'email'];
                    setNewSchedule({
                      ...newSchedule,
                      channels
                    });
                  }}>
                      <Mail className="w-4 h-4 mr-2" />
                      邮件
                    </Button>
                    <Button variant={newSchedule.channels.includes('wechat') ? 'default' : 'outline'} onClick={() => {
                    const channels = newSchedule.channels.includes('wechat') ? newSchedule.channels.filter(c => c !== 'wechat') : [...newSchedule.channels, 'wechat'];
                    setNewSchedule({
                      ...newSchedule,
                      channels
                    });
                  }}>
                      <Bell className="w-4 h-4 mr-2" />
                      微信
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleCreateSchedule} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    创建报表计划
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 报表计划列表 */}
            <Card>
              <CardHeader>
                <CardTitle>报表计划列表</CardTitle>
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
                        <TableHead>模板</TableHead>
                        <TableHead>下次运行</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map(schedule => <TableRow key={schedule._id}>
                          <TableCell className="font-medium">{schedule.scheduleName}</TableCell>
                          <TableCell>{getFrequencyLabel(schedule.frequency)}</TableCell>
                          <TableCell>{getTemplateName(schedule.templateId)}</TableCell>
                          <TableCell>
                            {schedule.nextRunTime ? new Date(schedule.nextRunTime).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={schedule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {schedule.status === 'active' ? '活跃' : '停用'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRunNow(schedule._id)}>
                              立即运行
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>报表模板</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">加载中...</p>
                  </div> : <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模板名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>内容类型</TableHead>
                        <TableHead>输出格式</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map(template => <TableRow key={template._id}>
                          <TableCell className="font-medium">{template.templateName}</TableCell>
                          <TableCell>{getFrequencyLabel(template.templateType)}</TableCell>
                          <TableCell>{template.contentType}</TableCell>
                          <TableCell>{template.format}</TableCell>
                          <TableCell>
                            <Badge className={template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {template.status === 'active' ? '活跃' : '停用'}
                            </Badge>
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
                <CardTitle>历史报表</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">加载中...</p>
                  </div> : <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>报表名称</TableHead>
                        <TableHead>模板</TableHead>
                        <TableHead>统计周期</TableHead>
                        <TableHead>格式</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map(report => <TableRow key={report._id}>
                          <TableCell className="font-medium">{report.reportName}</TableCell>
                          <TableCell>{getTemplateName(report.templateId)}</TableCell>
                          <TableCell>
                            {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{report.fileFormat}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>
                            {report.status === 'completed' && <div className="flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  下载
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleRegenerate(report._id)}>
                                  重新生成
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