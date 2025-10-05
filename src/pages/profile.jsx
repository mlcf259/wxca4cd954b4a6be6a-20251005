// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Avatar, AvatarFallback, AvatarImage, useToast } from '@/components/ui';
// @ts-ignore;
import { Settings, Award, Clock, Calendar, Heart, Star } from 'lucide-react';

export default function ProfilePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const user = $w.auth.currentUser;
  const stats = [{
    label: '总积分',
    value: '1,250',
    icon: Award,
    color: 'text-yellow-600'
  }, {
    label: '参与活动',
    value: '25',
    icon: Calendar,
    color: 'text-blue-600'
  }, {
    label: '志愿服务',
    value: '120',
    icon: Clock,
    color: 'text-green-600'
  }, {
    label: '捐赠次数',
    value: '8',
    icon: Heart,
    color: 'text-red-600'
  }];
  const recentActivities = [{
    id: 1,
    title: '社区环保清洁',
    date: '2025-10-05',
    points: 50,
    status: 'completed'
  }, {
    id: 2,
    title: '敬老院志愿服务',
    date: '2025-10-01',
    points: 80,
    status: 'completed'
  }, {
    id: 3,
    title: '图书馆整理',
    date: '2025-09-28',
    points: 40,
    status: 'completed'
  }];
  const handleSettings = () => {
    toast({
      title: "设置",
      description: "个人设置功能开发中"
    });
  };
  return <div className="min-h-screen bg-gray-50">
      {/* 用户信息头部 */}
      <div className="bg-green-600 text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-green-500 text-white text-xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || '志愿者'}</h1>
              <p className="text-green-100">公益志愿者 · 2年经验</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSettings}>
            <Settings className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400 mr-1" />
              <span className="text-2xl font-bold">4.8</span>
            </div>
            <p className="text-green-100 text-sm">评分</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">1,250</p>
            <p className="text-green-100 text-sm">公益积分</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">25</p>
            <p className="text-green-100 text-sm">参与活动</p>
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="p-4 -mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
              const Icon = stat.icon;
              return <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>;
            })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近参与 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>最近参与</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map(activity => <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">+{activity.points}</p>
                    <p className="text-xs text-gray-500 capitalize">{activity.status}</p>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 功能菜单 */}
      <div className="p-4">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <Button variant="ghost" className="w-full justify-start h-14 px-4">
                <Award className="w-5 h-5 mr-3 text-yellow-600" />
                我的积分
              </Button>
              <Button variant="ghost" className="w-full justify-start h-14 px-4">
                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                活动记录
              </Button>
              <Button variant="ghost" className="w-full justify-start h-14 px-4">
                <Heart className="w-5 h-5 mr-3 text-red-600" />
                捐赠记录
              </Button>
              <Button variant="ghost" className="w-full justify-start h-14 px-4">
                <Settings className="w-5 h-5 mr-3 text-gray-600" />
                设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 荣誉徽章 */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>荣誉徽章</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm font-medium">环保先锋</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">爱心志愿者</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">优秀贡献</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}