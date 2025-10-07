// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Badge } from '@/components/ui';
// @ts-ignore;
import { Search, RefreshCw, User, Shield, Save, Loader, AlertCircle } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminUserRolesPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('user-roles');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchAllData();
  }, []);
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchUsers(), fetchRoles(), fetchUserRoles()]);
    } catch (error) {
      console.error('获取数据失败:', error);
      setError(`获取用户角色数据失败: ${error.message || '请检查网络连接和数据源配置'}`);
      toast({
        title: "数据加载失败",
        description: "无法获取用户角色数据，请检查网络连接或联系管理员",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user',
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
        setUsers(result.records);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      throw error;
    }
  };
  const fetchRoles = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'role',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 100
        }
      });
      if (result && result.records) {
        setRoles(result.records);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error('获取角色数据失败:', error);
      throw error;
    }
  };
  const fetchUserRoles = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 1000
        }
      });
      if (result && result.records) {
        const userRoleMap = {};
        result.records.forEach(ur => {
          userRoleMap[ur.userId] = ur.roleId;
        });
        setUserRoles(userRoleMap);
      } else {
        setUserRoles({});
      }
    } catch (error) {
      console.error('获取用户角色失败:', error);
      throw error;
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
  const handleRoleChange = (userId, roleId) => {
    setUserRoles(prev => ({
      ...prev,
      [userId]: roleId
    }));
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // 先删除所有用户角色关系
      const currentUserRoles = await $w.cloud.callDataSource({
        dataSourceName: 'user_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 1000
        }
      });
      if (currentUserRoles && currentUserRoles.records) {
        for (const userRole of currentUserRoles.records) {
          await $w.cloud.callDataSource({
            dataSourceName: 'user_role',
            methodName: 'wedaDeleteV2',
            params: {
              filter: {
                where: {
                  $and: [{
                    _id: {
                      $eq: userRole._id
                    }
                  }]
                }
              }
            }
          });
        }
      }

      // 添加新的用户角色关系
      for (const [userId, roleId] of Object.entries(userRoles)) {
        if (roleId && roleId !== 'unassigned') {
          await $w.cloud.callDataSource({
            dataSourceName: 'user_role',
            methodName: 'wedaCreateV2',
            params: {
              data: {
                userId: userId,
                roleId: roleId,
                createdBy: $w.auth.currentUser?.userId || 'admin'
              }
            }
          });
        }
      }
      toast({
        title: "保存成功",
        description: "用户角色已更新"
      });

      // 刷新用户角色数据
      await fetchUserRoles();
    } catch (error) {
      console.error('保存用户角色失败:', error);
      setError(`保存用户角色失败: ${error.message || '请稍后重试'}`);
      toast({
        title: "保存失败",
        description: "用户角色保存失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone?.includes(searchTerm));
  const getUserRoleName = userId => {
    const roleId = userRoles[userId];
    if (!roleId || roleId === 'unassigned') {
      return '未分配';
    }
    const role = roles.find(r => r._id === roleId);
    return role ? role.roleName : '未知角色';
  };
  const getUserStatusBadge = status => {
    return status === 'active' ? <Badge className="bg-green-100 text-green-800">激活</Badge> : <Badge className="bg-gray-100 text-gray-800">停用</Badge>;
  };
  if (loading) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">正在加载用户角色数据...</p>
          </div>
        </div>
      </AdminLayout>;
  }
  if (error) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">数据加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchAllData} className="w-full bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                重试加载
              </Button>
              <Button variant="outline" onClick={() => $w.utils.navigateTo({
              pageId: 'admin-roles',
              params: {}
            })} className="w-full">
                返回角色管理
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>;
  }
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户角色管理</h1>
            <p className="text-gray-600">为用户分配系统角色</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchAllData} disabled={loading || saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存角色'}
            </Button>
          </div>
        </div>

        {/* 搜索 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索用户名称或手机号..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" disabled={loading || saving} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户角色表格 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              用户角色分配
              <Badge className="ml-2 bg-gray-100 text-gray-800">
                {Object.values(userRoles).filter(roleId => roleId && roleId !== 'unassigned').length} 个用户已分配角色
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">暂无用户数据</h3>
                <p className="mb-4">系统中还没有用户数据</p>
                <Button onClick={fetchAllData} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新加载
                </Button>
              </div> : roles.length === 0 ? <div className="text-center py-12 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">暂无角色数据</h3>
                <p className="mb-4">系统中还没有配置任何角色</p>
                <Button onClick={() => $w.utils.navigateTo({
              pageId: 'admin-roles',
              params: {}
            })} className="bg-blue-600 hover:bg-blue-700">
                  前往角色管理
                </Button>
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户ID</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>当前角色</TableHead>
                      <TableHead>分配角色</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => <TableRow key={user._id}>
                        <TableCell className="font-mono text-sm">{user._id?.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {getUserRoleName(user._id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select value={userRoles[user._id] || 'unassigned'} onValueChange={value => handleRoleChange(user._id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">未分配</SelectItem>
                              {roles.map(role => <SelectItem key={role._id} value={role._id}>
                                  {role.roleName}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && users.length > 0 && <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无相关用户</p>
                    <p className="text-sm mt-1">请尝试其他搜索关键词</p>
                  </div>}
              </div>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}