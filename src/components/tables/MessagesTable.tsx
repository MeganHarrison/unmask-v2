"use client"

import React, { useEffect, useState } from "react"
import { TextsDataTableEditable } from "../table/texts-data-table-editable"

type MessageRow = {
  id: number
  date_time: string | null
  sender: string | null
  message: string | null
  notes: string | null
  category: string | null
  tag: string | null
  relationship_id: number | null
}

interface ApiResponse {
  success: boolean
  data?: MessageRow[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function MessagesTable() {
  const [data, setData] = useState<MessageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })

  const fetchMessages = async (page = 1, limit = 50) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/texts-brandon?page=${page}&limit=${limit}`)
      const json: ApiResponse = await res.json()
      if (json.success && json.data) {
        setData(json.data as MessageRow[])
        if (json.pagination) setPagination(json.pagination)
      } else {
        setData([])
      }
    } catch (err) {
      console.error("Failed to fetch messages", err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleUpdateRow = async (id: number, field: string, value: string) => {
    try {
      const res = await fetch("/api/texts-brandon", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      })
      const result: any = await res.json()
      if (result.success) {
        setData((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
      }
    } catch (err) {
      console.error("Failed to update row", err)
    }
  }

  const handleDeleteRow = async (id: number) => {
    if (!confirm(`Delete message #${id}?`)) return
    try {
      const res = await fetch(`/api/texts-brandon?id=${id}`, { method: "DELETE" })
      const result: any = await res.json()
      if (result.success) {
        setData((prev) => prev.filter((row) => row.id !== id))
        setPagination((prev) => ({
          ...prev,
          total: Math.max(prev.total - 1, 0),
          totalPages: prev.limit ? Math.ceil(Math.max(prev.total - 1, 0) / prev.limit) : prev.totalPages,
        }))
      }
    } catch (err) {
      console.error("Failed to delete row", err)
    }
  }

  return (
    <TextsDataTableEditable
      data={data}
      loading={loading}
      pagination={pagination}
      onPageChange={(page) => fetchMessages(page, pagination.limit)}
      onPageSizeChange={(limit) => fetchMessages(1, limit)}
      onUpdateRow={handleUpdateRow}
      onDeleteRow={handleDeleteRow}
    />
  )
}
