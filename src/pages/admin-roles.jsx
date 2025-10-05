// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge, Input } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Edit, Trash2, Shield, RefreshCw } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminRolesPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchRoles();
  }, []);
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'role',
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
      if (result && result.records) {
        setRoles(result.records);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('获取角色数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取角色列表",
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
  const handleEditRole = role => {
    toast({
      title: "编辑角色",
      description: `编辑角色: ${role.roleName}`
    });
  };
  const handleDeleteRole = role => {
    if (role.isSystem) {
      toast({
        title: "无法删除",
        description: "系统角色不能删除",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "删除角色",
      description: `删除角色: ${role.roleName}`,
      variant: "destructive"
    });
  };
  const handleManagePermissions = role => {
    $w.utils.navigateTo({
      pageId: 'admin-role-permissions',
      params: {
        roleId: role._id,
        roleName: role.roleName
      }
    });
  };
  const filteredRoles = roles.filter(role => role.roleName?.toLowerCase().includes(searchTerm.toLowerCase()) || role.roleCode?.toLowerCase().includes(searchTerm.toLowerCase()));
  const getStatusBadge = status => {
    return status === 'active' ? <Badge className="bg-green-100 text-green-800">激活</Badge> : <Badge className="bg-gray-100 text-gray-800">停用</Badge>;
  };
  const getSystemBadge = isSystem => {
    return isSystem ? <Badge className="bg-blue-100 text-blue-800">系统</Badge> : <Badge className="bg-gray-100 text-gray-800">自定义</Badge>;
  };
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
            <p className="text-gray-600">管理系统角色和权限</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchRoles}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加角色
            </Button>
          </div>
        </div>

        {/* 搜索 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索角色名称或代码..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 角色表格 */}
        <Card>
          <CardHeader>
            <CardTitle>角色列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-gray-600">加载中...</p>
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色名称</TableHead>
                      <TableHead>角色代码</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map(role => <TableRow key={role._id}>
                        <TableCell className="font-medium">{role.roleName}</TableCell>
                        <TableCell className="font-mono text-sm">{role.roleCode}</TableCell>
                        <TableCell className="text-sm text-gray-600">{role.description}</TableCell>
                        <TableCell>{getSystemBadge(role.isSystem)}</TableCell>
                        <TableCell>{getStatusBadge(role.status)}</TableCell>
                        <TableCell>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleManagePermissions(role)}>
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!role.isSystem && <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>}
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>

                {filteredRoles.length === 0 && roles.length > 0 && <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无相关角色</p>
                  </div>}

                {roles.length === 0 && <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无角色数据</p>
                  </div>}
              </div>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}