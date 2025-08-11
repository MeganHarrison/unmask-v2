"use client";

import React from 'react';

export function EnhancedTextsTable() {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Message</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-4" colSpan={3}>
                No messages to display
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}