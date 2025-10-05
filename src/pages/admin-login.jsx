// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // 模拟管理员登录验证
      if (formData.username === 'admin' && formData.password === 'admin123') {
        toast({
          title: "登录成功",
          description: "欢迎进入管理系统"
        });
        $w.utils.navigateTo({
          pageId: 'admin-dashboard',
          params: {}
        });
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: "网络连接异常",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">公益志愿者管理系统</CardTitle>
          <p className="text-gray-600 mt-2">管理员登录</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="username" placeholder="请输入管理员账号" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="pl-10 pr-10" required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              测试账号: admin / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
}