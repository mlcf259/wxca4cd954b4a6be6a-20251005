// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Checkbox, Badge } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Shield, RefreshCw, Loader, AlertCircle, Folder, File } from 'lucide-react';

import { AdminLayout } from '@/components/AdminLayout';
export default function AdminRolePermissionsPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('roles');
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const roleId = $w.page.dataset.params?.roleId;
  const roleName = $w.page.dataset.params?.roleName;
  useEffect(() => {
    if (roleId) {
      fetchAllData();
    } else {
      setError('缺少角色ID参数');
      setLoading(false);
    }
  }, [roleId]);
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchPermissions(), fetchRolePermissions()]);
    } catch (error) {
      console.error('获取数据失败:', error);
      setError(`获取权限数据失败: ${error.message || '请检查网络连接和数据源配置'}`);
      toast({
        title: "数据加载失败",
        description: "无法获取权限数据，请检查网络连接或联系管理员",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchPermissions = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 200,
          orderBy: [{
            sortOrder: 'asc'
          }]
        }
      });
      if (result && result.records) {
        setPermissions(result.records);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('获取权限数据失败:', error);
      throw error;
    }
  };
  const fetchRolePermissions = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'role_permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                roleId: {
                  $eq: roleId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: false
        }
      });
      if (result && result.records) {
        setRolePermissions(result.records.map(rp => rp.permissionId));
      } else {
        setRolePermissions([]);
      }
    } catch (error) {
      console.error('获取角色权限失败:', error);
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
  const handleBack = () => {
    $w.utils.navigateTo({
      pageId: 'admin-roles',
      params: {}
    });
  };
  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setRolePermissions(prev => [...prev, permissionId]);
    } else {
      setRolePermissions(prev => prev.filter(id => id !== permissionId));
    }
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // 先删除现有权限
      const currentPermissions = await $w.cloud.callDataSource({
        dataSourceName: 'role_permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                roleId: {
                  $eq: roleId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: false
        }
      });
      if (currentPermissions && currentPermissions.records) {
        for (const perm of currentPermissions.records) {
          await $w.cloud.callDataSource({
            dataSourceName: 'role_permission',
            methodName: 'wedaDeleteV2',
            params: {
              filter: {
                where: {
                  $and: [{
                    _id: {
                      $eq: perm._id
                    }
                  }]
                }
              }
            }
          });
        }
      }

      // 添加新权限
      for (const permissionId of rolePermissions) {
        await $w.cloud.callDataSource({
          dataSourceName: 'role_permission',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              roleId: roleId,
              permissionId: permissionId,
              createdBy: $w.auth.currentUser?.userId || 'admin'
            }
          }
        });
      }
      toast({
        title: "保存成功",
        description: `角色 ${roleName} 的权限已更新`
      });

      // 刷新权限数据
      await fetchRolePermissions();
    } catch (error) {
      console.error('保存权限失败:', error);
      setError(`保存权限失败: ${error.message || '请稍后重试'}`);
      toast({
        title: "保存失败",
        description: "权限保存失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const getModulePermissions = module => {
    return permissions.filter(p => p.module === module && !p.parentId);
  };
  const getChildPermissions = parentId => {
    return permissions.filter(p => p.parentId === parentId);
  };
  const getPermissionTypeBadge = type => {
    const config = {
      menu: {
        label: '菜单',
        color: 'bg-blue-100 text-blue-800'
      },
      button: {
        label: '按钮',
        color: 'bg-green-100 text-green-800'
      },
      api: {
        label: '接口',
        color: 'bg-purple-100 text-purple-800'
      }
    };
    return <Badge className={config[type]?.color || 'bg-gray-100 text-gray-800'}>{config[type]?.label || type}</Badge>;
  };
  const modules = [...new Set(permissions.map(p => p.module))];
  if (error && !roleId) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">参数错误</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleBack} className="w-full bg-blue-600 hover:bg-blue-700">
              返回角色管理
            </Button>
          </div>
        </div>
      </AdminLayout>;
  }
  if (loading) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">正在加载权限数据...</p>
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
              <Button variant="outline" onClick={handleBack} className="w-full">
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
            <Button variant="ghost" onClick={handleBack} className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">权限分配 - {roleName}</h1>
            <p className="text-gray-600">为角色分配系统权限</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchAllData} disabled={loading || saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存权限'}
            </Button>
          </div>
        </div>

        {/* 权限树 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              系统权限
              <Badge className="ml-2 bg-gray-100 text-gray-800">{rolePermissions.length} 个权限已选择</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? <div className="text-center py-12 text-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">暂无权限数据</h3>
                <p className="mb-4">系统中还没有配置任何权限</p>
                <Button onClick={fetchAllData} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新加载
                </Button>
              </div> : <div className="space-y-6">
                {modules.map(module => <div key={module}>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{module}模块</h3>
                    <div className="space-y-2">
                      {getModulePermissions(module).map(permission => <div key={permission._id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Folder className="w-4 h-4 text-blue-500" />
                              <div>
                                <h4 className="font-medium">{permission.permissionName}</h4>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPermissionTypeBadge(permission.type)}
                              <Checkbox checked={rolePermissions.includes(permission._id)} onCheckedChange={checked => handlePermissionChange(permission._id, checked)} />
                            </div>
                          </div>

                          {getChildPermissions(permission._id).length > 0 && <div className="pl-8 space-y-2">
                              {getChildPermissions(permission._id).map(child => <div key={child._id} className="flex items-center justify-between p-3 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <File className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <span className="text-sm font-medium">{child.permissionName}</span>
                                      <p className="text-xs text-gray-500">{child.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getPermissionTypeBadge(child.type)}
                                    <Checkbox checked={rolePermissions.includes(child._id)} onCheckedChange={checked => handlePermissionChange(child._id, checked)} />
                                  </div>
                                </div>)}
                            </div>}
                        </div>)}
                    </div>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}