// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Avatar, AvatarFallback, AvatarImage, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, Heart, Gift, BookOpen, Users, Clock } from 'lucide-react';

export default function HomePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const user = $w.auth.currentUser;
  const activities = [{
    id: 1,
    title: '社区环保清洁',
    date: '2025-10-10',
    location: '朝阳公园',
    points: 50,
    image: 'https://images.unsplash.com/photo-1577720643272-265f0936742a?w=500&h=300&fit=crop'
  }, {
    id: 2,
    title: '敬老院志愿服务',
    date: '2025-10-15',
    location: '幸福敬老院',
    points: 80,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=300&fit=crop'
  }];
  const handleActivityJoin = activityId => {
    toast({
      title: "报名成功",
      description: "已成功报名参加活动"
    });
  };
  const navigateTo = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  return <div className="min-h-screen bg-green-50">
      {/* 头部用户信息 */}
      <div className="bg-green-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.name || '志愿者'}</h2>
              <p className="text-green-100">公益志愿者</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">1,250</p>
            <p className="text-green-100">公益积分</p>
          </div>
        </div>
      </div>

      {/* 快速入口 */}
      <div className="p-4 grid grid-cols-4 gap-3 bg-white">
        <Button variant="ghost" className="flex flex-col h-auto p-3" onClick={() => navigateTo('activity')}>
          <Calendar className="w-6 h-6 mb-1 text-green-600" />
          <span className="text-xs">活动</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-auto p-3" onClick={() => navigateTo('integral')}>
          <Gift className="w-6 h-6 mb-1 text-green-600" />
          <span className="text-xs">积分</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-auto p-3" onClick={() => navigateTo('donation')}>
          <BookOpen className="w-6 h-6 mb-1 text-green-600" />
          <span className="text-xs">账本</span>
        </Button>
        <Button variant="ghost" className="flex flex-col h-auto p-3" onClick={() => navigateTo('profile')}>
          <Users className="w-6 h-6 mb-1 text-green-600" />
          <span className="text-xs">我的</span>
        </Button>
      </div>

      {/* 推荐活动 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">推荐活动</h3>
        <div className="space-y-4">
          {activities.map(activity => <Card key={activity.id} className="overflow-hidden">
              <img src={activity.image} alt={activity.title} className="w-full h-32 object-cover" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {activity.date}
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    {activity.points}积分
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{activity.location}</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleActivityJoin(activity.id)}>
                  立即报名
                </Button>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* 数据统计 */}
      <div className="p-4 bg-white mt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">25</p>
            <p className="text-sm text-gray-600">参与活动</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">1,250</p>
            <p className="text-sm text-gray-600">总积分</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-600">兑换记录</p>
          </div>
        </div>
      </div>
    </div>;
}