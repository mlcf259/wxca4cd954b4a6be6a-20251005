// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Calendar, MapPin, Users, Clock, Loader } from 'lucide-react';

export default function ActivityPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchActivities();
  }, []);
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'activity',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: false,
          pageSize: 20,
          pageNumber: 1,
          orderBy: [{
            date: 'asc'
          }]
        }
      });
      if (result && result.records) {
        setActivities(result.records);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('获取活动数据失败:', err);
      setError('获取活动数据失败，请稍后重试');
      toast({
        title: "数据加载失败",
        description: "无法获取活动数据，请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) || activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || activity.status === filter;
    return matchesSearch && matchesFilter;
  });
  const handleJoinActivity = async activityId => {
    try {
      const user = $w.auth.currentUser;
      if (!user || !user.userId) {
        toast({
          title: "请先登录",
          description: "需要登录后才能报名活动",
          variant: "destructive"
        });
        return;
      }

      // 这里可以添加报名逻辑，调用志愿者报名数据模型
      toast({
        title: "报名成功",
        description: "已成功报名参加活动"
      });

      // 刷新活动数据
      await fetchActivities();
    } catch (error) {
      console.error('报名失败:', error);
      toast({
        title: "报名失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  const navigateToDetail = activityId => {
    $w.utils.navigateTo({
      pageId: 'activity-detail',
      params: {
        id: activityId
      }
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 text-green-600 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchActivities} className="bg-green-600 hover:bg-green-700">
            重试
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* 搜索和筛选 */}
      <div className="bg-white p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索活动..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="bg-green-600 text-white">
            全部
          </Button>
          <Button variant={filter === 'ongoing' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ongoing')}>
            进行中
          </Button>
          <Button variant={filter === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('upcoming')}>
            即将开始
          </Button>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="p-4 space-y-4">
        {filteredActivities.map(activity => <Card key={activity._id} className="overflow-hidden cursor-pointer" onClick={() => navigateToDetail(activity._id)}>
            {activity.image && <img src={activity.image} alt={activity.title} className="w-full h-40 object-cover" />}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{activity.title || '未命名活动'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                {activity.date && <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {activity.date}
                  </div>}
                {activity.location && <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {activity.location}
                  </div>}
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {activity.participants || 0}/{activity.maxParticipants || 0} 人
                </div>
                {activity.points && <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    {activity.points} 积分
                  </div>}
              </div>
              
              {activity.description && <p className="text-sm text-gray-500 mt-3 mb-4">{activity.description}</p>}
              
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={e => {
            e.stopPropagation();
            handleJoinActivity(activity._id);
          }}>
                立即报名
              </Button>
            </CardContent>
          </Card>)}
        
        {filteredActivities.length === 0 && activities.length > 0 && <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无相关活动</p>
          </div>}

        {activities.length === 0 && <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无活动数据</p>
            <Button onClick={fetchActivities} className="mt-4 bg-green-600 hover:bg-green-700">
              刷新
            </Button>
          </div>}
      </div>
    </div>;
}