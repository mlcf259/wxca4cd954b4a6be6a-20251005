// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, MapPin, Users, Clock, Heart, Share, Bookmark, Loader } from 'lucide-react';

export default function ActivityDetailPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activity, setActivity] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const activityId = $w.page.dataset.params?.id;
  const user = $w.auth.currentUser;
  useEffect(() => {
    fetchActivityData();
  }, [activityId]);
  const fetchActivityData = async () => {
    try {
      setLoading(true);

      // 获取活动详情
      const activityResult = await $w.cloud.callDataSource({
        dataSourceName: 'activity',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: activityId
                }
              }]
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (activityResult) {
        setActivity(activityResult);
      }

      // 如果用户已登录，查询报名状态
      if (user && user.userId) {
        const registrationResult = await $w.cloud.callDataSource({
          dataSourceName: 'volunteer_registration',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                $and: [{
                  userId: {
                    $eq: user.userId
                  }
                }, {
                  activityId: {
                    $eq: activityId
                  }
                }]
              }
            },
            select: {
              $master: true
            },
            pageSize: 1,
            pageNumber: 1
          }
        });
        if (registrationResult && registrationResult.records && registrationResult.records.length > 0) {
          setRegistration(registrationResult.records[0]);
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法获取活动信息，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleJoin = async () => {
    if (!user || !user.userId) {
      toast({
        title: "请先登录",
        description: "需要登录后才能报名活动",
        variant: "destructive"
      });
      return;
    }
    try {
      setSubmitting(true);

      // 创建报名记录
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'volunteer_registration',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: user.userId,
            activityId: activityId,
            activityTitle: activity?.title,
            activityPoints: activity?.points,
            registrationTime: Date.now(),
            checkInStatus: false,
            status: '已报名',
            pointsAwarded: 0
          }
        }
      });
      if (result && result.id) {
        setRegistration({
          _id: result.id,
          userId: user.userId,
          activityId: activityId,
          activityTitle: activity?.title,
          activityPoints: activity?.points,
          registrationTime: Date.now(),
          checkInStatus: false,
          status: '已报名',
          pointsAwarded: 0
        });

        // 更新活动参与人数
        await $w.cloud.callDataSource({
          dataSourceName: 'activity',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              participants: (activity?.participants || 0) + 1
            },
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: activityId
                  }
                }]
              }
            }
          }
        });
        toast({
          title: "报名成功",
          description: "已成功报名参加活动"
        });

        // 刷新活动数据
        await fetchActivityData();
      }
    } catch (error) {
      console.error('报名失败:', error);
      toast({
        title: "报名失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleCheckIn = async () => {
    try {
      setSubmitting(true);

      // 更新签到状态
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'volunteer_registration',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            checkInStatus: true,
            checkInTime: Date.now(),
            pointsAwarded: activity?.points,
            status: '已签到'
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: registration._id
                }
              }]
            }
          }
        }
      });
      if (result && result.count > 0) {
        setRegistration(prev => ({
          ...prev,
          checkInStatus: true,
          checkInTime: Date.now(),
          pointsAwarded: activity?.points,
          status: '已签到'
        }));

        // 创建积分记录
        await $w.cloud.callDataSource({
          dataSourceName: 'points_record',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              userId: user.userId,
              pointsType: '活动参与',
              pointsValue: activity?.points,
              recordTime: Date.now(),
              sourceActivity: activity?.title,
              activityId: activityId,
              description: `参与活动: ${activity?.title}`,
              status: '已生效'
            }
          }
        });
        toast({
          title: "签到成功",
          description: `获得${activity?.points}公益积分`
        });
      }
    } catch (error) {
      console.error('签到失败:', error);
      toast({
        title: "签到失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleShare = () => {
    toast({
      title: "已复制分享链接",
      description: "邀请朋友一起参与公益活动"
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
  if (!activity) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">活动不存在</p>
          <Button onClick={() => $w.utils.navigateBack()} className="bg-green-600 hover:bg-green-700">
            返回
          </Button>
        </div>
      </div>;
  }
  const isJoined = !!registration;
  const isCheckedIn = registration?.checkInStatus;
  return <div className="min-h-screen bg-gray-50">
      {/* 活动封面 */}
      <div className="relative">
        {activity.image && <img src={activity.image} alt={activity.title} className="w-full h-48 object-cover" />}
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="icon" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 活动基本信息 */}
      <Card className="mx-4 -mt-6 relative z-10">
        <CardHeader>
          <CardTitle className="text-xl">{activity.title || '未命名活动'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.date && <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {activity.date}
            </div>}
          {activity.location && <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {activity.location}
            </div>}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {activity.participants || 0}/{activity.maxParticipants || 0} 人报名
          </div>
          {activity.points && <div className="flex items-center text-sm text-green-600 font-semibold">
              <Heart className="w-4 h-4 mr-2" />
              {activity.points} 公益积分
            </div>}
        </CardContent>
      </Card>

      {/* 活动详情 */}
      <div className="p-4 space-y-4">
        {activity.description && <Card>
            <CardHeader>
              <CardTitle className="text-lg">活动介绍</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{activity.description}</p>
            </CardContent>
          </Card>}

        {activity.schedule && activity.schedule.length > 0 && <Card>
            <CardHeader>
              <CardTitle className="text-lg">活动安排</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activity.schedule.map((item, index) => <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-600">{item}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>}

        {activity.requirements && <Card>
            <CardHeader>
              <CardTitle className="text-lg">活动要求</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{activity.requirements}</p>
            </CardContent>
          </Card>}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">组织信息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {activity.organizer && <><strong>主办方：</strong>{activity.organizer}<br /></>}
              {activity.contact && <><strong>联系人：</strong>{activity.contact}</>}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        {!user || !user.userId ? <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
        toast({
          title: "请先登录",
          description: "需要登录后才能报名活动",
          variant: "destructive"
        });
      }}>
            立即报名
          </Button> : !isJoined ? <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleJoin} disabled={submitting}>
            {submitting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            立即报名
          </Button> : !isCheckedIn ? <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCheckIn} disabled={submitting}>
            {submitting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
            签到获得积分
          </Button> : <Button className="w-full bg-gray-600" disabled>
            <Heart className="w-4 h-4 mr-2" />
            已获得 {registration.pointsAwarded || activity.points} 积分
          </Button>}
      </div>
    </div>;
}