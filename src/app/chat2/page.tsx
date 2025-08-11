'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
<div className="h-full">
    
      <ChatInterface useAutoRAG={true} />
    </div>
  );
}