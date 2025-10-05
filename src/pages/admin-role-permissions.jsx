// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Checkbox } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Shield, RefreshCw } from 'lucide-react';

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
  const roleId = $w.page.dataset.params?.roleId;
  const roleName = $w.page.dataset.params?.roleName;
  useEffect(() => {
    if (roleId) {
      fetchPermissions();
      fetchRolePermissions();
    }
  }, [roleId]);
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
      }
    } catch (error) {
      console.error('获取权限数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取权限列表",
        variant: "destructive"
      });
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
      }
    } catch (error) {
      console.error('获取角色权限失败:', error);
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
              createdBy: 'admin'
            }
          }
        });
      }
      toast({
        title: "保存成功",
        description: "角色权限已更新"
      });
    } catch (error) {
      console.error('保存权限失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
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
  const modules = [...new Set(permissions.map(p => p.module))];
  if (loading) {
    return <AdminLayout activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600">加载权限数据...</p>
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
            <Button variant="outline" onClick={() => {
            fetchPermissions();
            fetchRolePermissions();
          }}>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {modules.map(module => <div key={module}>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">{module}模块</h3>
                  <div className="space-y-2">
                    {getModulePermissions(module).map(permission => <div key={permission._id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{permission.permissionName}</h4>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          <Checkbox checked={rolePermissions.includes(permission._id)} onCheckedChange={checked => handlePermissionChange(permission._id, checked)} />
                        </div>

                        {getChildPermissions(permission._id).length > 0 && <div className="pl-6 space-y-2 border-l-2 border-gray-200 ml-2">
                            {getChildPermissions(permission._id).map(child => <div key={child._id} className="flex items-center justify-between py-2">
                                <div>
                                  <span className="text-sm">{child.permissionName}</span>
                                  <p className="text-xs text-gray-500">{child.description}</p>
                                </div>
                                <Checkbox checked={rolePermissions.includes(child._id)} onCheckedChange={checked => handlePermissionChange(child._id, checked)} />
                              </div>)}
                          </div>}
                      </div>)}
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>;
}