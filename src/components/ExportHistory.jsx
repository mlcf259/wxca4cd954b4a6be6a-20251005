// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, FileText, FileSpreadsheet, Calendar, RefreshCw } from 'lucide-react';

export function ExportHistory({
  exports,
  onReexport,
  onRefresh
}) {
  const getStatusBadge = status => {
    const statusConfig = {
      'processing': {
        color: 'bg-blue-100 text-blue-800',
        label: '处理中'
      },
      'completed': {
        color: 'bg-green-100 text-green-800',
        label: '已完成'
      },
      'failed': {
        color: 'bg-red-100 text-red-800',
        label: '失败'
      }
    };
    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-800',
      label: status || '未知'
    };
    return <Badge className={config.color}>{config.label}</Badge>;
  };
  const getDataTypeLabel = type => {
    const typeLabels = {
      'activity': '活动数据',
      'volunteer': '志愿者数据',
      'points': '积分记录',
      'donation': '捐赠记录'
    };
    return typeLabels[type] || type;
  };
  const getFormatIcon = format => {
    return format === 'excel' ? <FileSpreadsheet className="w-4 h-4 text-green-600" /> : <FileText className="w-4 h-4 text-blue-600" />;
  };
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>导出历史记录</CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exports.map(exportItem => <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getFormatIcon(exportItem.format)}
                <div>
                  <div className="font-medium">{getDataTypeLabel(exportItem.dataType)}</div>
                  <div className="text-sm text-gray-500">
                    {exportItem.recordCount}条记录 · {new Date(exportItem.exportTime).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusBadge(exportItem.status)}
                {exportItem.status === 'completed' && <Button variant="ghost" size="sm" onClick={() => onReexport(exportItem)}>
                    <Download className="w-4 h-4" />
                  </Button>}
              </div>
            </div>)}
          
          {exports.length === 0 && <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无导出记录</p>
            </div>}
        </div>
      </CardContent>
    </Card>;
}