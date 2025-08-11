// src/app/messages-enhanced/page.tsx
"use client";

import { EnhancedTextsTable } from '@/components/enhanced-texts-table';

export default function EnhancedMessagesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enhanced Message Analysis
        </h1>
        <p className="text-gray-600">
          Advanced filtering and analysis of your text message data with dynamic filters and real-time search.
        </p>
      </div>
      
      <EnhancedTextsTable />
    </div>
  );
}