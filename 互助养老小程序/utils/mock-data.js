// 共享 Mock 数据

const announcements = [
  {
    id: 1,
    title: '2024年度社区医保政策调整宣讲会',
    date: '2024-05-25',
    category: '政策解读',
    icon: 'campaign',
    isNew: true,
    isTop: true,
    description: '为帮助社区老人更好了解医保新规，我们将于本周五下午在社区活动中心举办专题讲座。'
  },
  {
    id: 2,
    title: '"情暖夏日"高龄老人助餐补助手续办理',
    date: '2024-05-22',
    category: '福利待遇',
    icon: 'restaurant',
    isNew: false,
    isTop: false,
    description: '满80周岁的社区居民可带身份证件前往服务站办理夏季助餐补助，每餐可享受3-5元优惠。'
  },
  {
    id: 3,
    title: '长者学堂：智能手机基础操作班招募中',
    date: '2024-05-20',
    category: '社区活动',
    icon: 'smart-toy',
    isNew: false,
    isTop: false,
    description: '教您如何使用微信视频聊天、手机预约挂号及申领电子医保卡。名额有限，报完即止。'
  },
  {
    id: 4,
    title: '关于近期社区反诈骗宣传的温馨提示',
    date: '2024-05-18',
    category: '安全防范',
    icon: 'info',
    isNew: false,
    isTop: false,
    description: '谨防陌生人推销高价保健品，不向陌生账号转账。遇到可疑情况请及时联系社区民警或子女。'
  }
];

const announcementDetails = {
  1: {
    title: '2024年度社区医保政策调整宣讲会',
    date: '2024-05-25',
    category: '政策解读',
    content: '<p>尊敬的社区居民：</p><p>为了让大家深入了解2024年度医疗保险政策的新变化，特别是针对老年群体的门诊统筹报销比例提升及异地就医结算简化等重点内容，社区居委会特邀区医保局专家进行现场讲解。</p><h4>宣讲重点：</h4><ul><li>门诊特殊病种范围扩增解读。</li><li>老年人长期护理保险申请流程。</li><li>手机端"医保电子凭证"的操作教学。</li></ul><h4>活动安排：</h4><p>时间：本周五（5月25日）下午 14:30 - 16:30</p><p>地点：社区文化活动中心三楼多功能厅</p>',
    publisher: '兴华社区居委会',
    views: 128
  },
  2: {
    title: '"情暖夏日"高龄老人助餐补助手续办理',
    date: '2024-05-22',
    category: '福利待遇',
    content: '<p>满80周岁的社区居民可携带身份证件前往服务站办理夏季助餐补助。</p>',
    publisher: '兴华社区居委会',
    views: 95
  }
};

const leaderboardList = [
  { rank: 1, name: '李大伯', score: '182h', avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?q=80&w=200&auto=format&fit=crop' },
  { rank: 2, name: '王阿姨', score: '156h', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&auto=format&fit=crop' },
  { rank: 3, name: '张小哥', score: '142h', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
  { rank: 4, name: '刘老师', score: '120h', avatar: 'https://images.unsplash.com/photo-1544168190-79c17527004f?q=80&w=200&auto=format&fit=crop' },
  { rank: 5, name: '赵大姐', score: '115h', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
  { rank: 6, name: '孙医生', score: '108h', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }
];

const logisticsEvents = [
  { time: '2023-08-30 09:45', status: '派送中', description: '【上海市】您的订单由徐家汇派送员张师傅派送中，请保持手机畅通', icon: 'delivery', isLatest: true },
  { time: '2023-08-30 02:15', status: '到达中转站', description: '【上海市】快件已到达 上海静安中转站', icon: 'hub', isLatest: false },
  { time: '2023-08-29 18:30', status: '运输中', description: '【昆山市】快件离开 昆山分拨中心，发往 上海中转站', icon: 'shipping', isLatest: false },
  { time: '2023-08-29 15:20', status: '已揽收', description: '【昆山市】您的订单已由 EMS 昆山营业部揽收', icon: 'package', isLatest: false },
  { time: '2023-08-29 14:20', status: '已下单', description: '您的订单已提交，等待卖家发货', icon: 'checklist', isLatest: false }
];

module.exports = {
  announcements,
  announcementDetails,
  leaderboardList,
  logisticsEvents
};
