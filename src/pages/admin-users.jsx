// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Edit, Trash2, RefreshCw, Plus, Users } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminUsersPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 50,
          pageNumber: 1,
          orderBy: [{
            registrationTime: 'desc'
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
      toast({
        title: "数据加载失败",
        description: "无法获取用户列表",
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
  const handleEditUser = user => {
    toast({
      title: "编辑用户",
      description: `编辑用户: ${user.name}`
    });
  };
  const handleResetPassword = user => {
    toast({
      title: "重置密码",
      description: `已重置用户 ${user.name} 的密码`
    });
  };
  const handleDeleteUser = user => {
    toast({
      title: "删除用户",
      description: `删除用户: ${user.name}`,
      variant: "destructive"
    });
  };
  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone?.includes(searchTerm));
  return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-600">管理志愿者用户信息</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加用户
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索用户..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户表格 */}
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-gray-600">加载中...</p>
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户ID</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>积分余额</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => <TableRow key={user._id}>
                        <TableCell className="font-mono text-sm">{user._id?.substring(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.pointsBalance || 0}</TableCell>
                        <TableCell>{user.registrationTime ? new Date(user.registrationTime).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.status || 'active'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user)}>
                              重置密码
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && users.length > 0 && <div className="text-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无相关用户</p>
                  </div>}

                {users.length === 0 && <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无用户数据</p>
                  </div>}
              </div>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}