import React from 'react';
import { redirect } from 'next/navigation';

const EventPage = () => {
  // 默认重定向到示例事件详情页面
  redirect('/event/1');
};

export default EventPage;