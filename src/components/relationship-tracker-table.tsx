"use client";

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { DataTable, schema } from './data-table';

export default function RelationshipTrackerTable() {
  const [rows, setRows] = useState<z.infer<typeof schema>[]>([]);

  useEffect(() => {
    fetch('/api/relationship-tracker')
      .then(res => res.json())
      .then((json: any) => setRows(json.data || []))
      .catch(err => console.error('Failed to load relationship tracker', err));
  }, []);

  return <DataTable key={rows.length} data={rows} />;
}
