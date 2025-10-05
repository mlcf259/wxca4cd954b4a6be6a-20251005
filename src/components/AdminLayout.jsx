// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Users, Gift, BarChart3, LogOut, Menu, X, TrendingUp, Shield, Download, FileText, Database } from 'lucide-react';

export function AdminLayout({
  children,
  activeTab,
  onTabChange,
  onLogout
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const menuItems = [{
    id: 'dashboard',
    label: '仪表盘',
    icon: BarChart3
  }, {
    id: 'users',
    label: '用户管理',
    icon: Users
  }, {
    id: 'exchange',
    label: '积分兑换',
    icon: Gift
  }, {
    id: 'analytics',
    label: '数据分析',
    icon: TrendingUp
  }, {
    id: 'roles',
    label: '角色管理',
    icon: Shield
  }, {
    id: 'user-roles',
    label: '用户角色',
    icon: Users
  }, {
    id: 'export',
    label: '数据导出',
    icon: Download
  }, {
    id: 'reports',
    label: '自动化报表',
    icon: FileText
  }, {
    id: 'backup',
    label: '数据备份',
    icon: Database
  }];
  return <div className="min-h-screen bg-gray-100">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <h1 className="text-white font-bold text-lg">管理系统</h1>
          <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          {menuItems.map(item => {
          const Icon = item.icon;
          return <Button key={item.id} variant={activeTab === item.id ? 'default' : 'ghost'} className="w-full justify-start mb-2 text-white hover:bg-gray-700" onClick={() => {
            onTabChange(item.id);
            setSidebarOpen(false);
          }}>
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>;
        })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            退出登录
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">管理员</span>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>;
}