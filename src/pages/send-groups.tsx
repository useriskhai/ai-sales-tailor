import React, { useEffect } from 'react';
import { SendingGroupManager } from '@/components/SendingGroupManager';

export default function SendingGroupsPage() {
  useEffect(() => {
    document.title = "送信グループ管理";
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <SendingGroupManager />
    </div>
  );
}
