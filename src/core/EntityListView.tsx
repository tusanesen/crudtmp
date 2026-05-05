import { useEffect, useMemo, useState } from 'react'
import { Button, Popconfirm, Space, Table, message } from 'antd'
import type { TableProps } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { deleteJson } from '../api/apiClient'
import type { EntityBase } from '../types/entities'

type EntityListViewProps<T extends EntityBase> = {
  apiPath: string
  columns: TableProps<T>['columns']
  dataSource: TableProps<T>['dataSource']
  loading?: TableProps<T>['loading']
  onRow?: TableProps<T>['onRow']
  rowSelection?: TableProps<T>['rowSelection']
  enableSingleSelect?: boolean
  onSelectedRowChange?: (selectedRow: T | null) => void
  onSelectedRowsChange?: (selectedRows: T[]) => void
  enableCreateEditActions?: boolean
  actions?: {
    createLabel?: string
    editLabel?: string
    deleteLabel?: string
    showCreate?: boolean
    showEdit?: boolean
    showDelete?: boolean
  }
  rowKey?: TableProps<T>['rowKey']
  pagination?: TableProps<T>['pagination']
  scroll?: TableProps<T>['scroll']
}

export function EntityListView<T extends EntityBase>(props: EntityListViewProps<T>) {
  const {
    apiPath,
    columns,
    dataSource,
    loading,
    onRow,
    rowSelection,
    enableSingleSelect,
    onSelectedRowChange,
    onSelectedRowsChange,
    enableCreateEditActions,
    actions,
    rowKey,
    pagination,
    scroll,
  } = props
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([])

  const selectedRow = useMemo(
    () => dataSource?.find((item) => item.id === selectedRowId) ?? null,
    [dataSource, selectedRowId],
  )
  const selectedRows = useMemo(
    () => dataSource?.filter((item) => selectedRowIds.includes(item.id)) ?? [],
    [dataSource, selectedRowIds],
  )

  useEffect(() => {
    if (selectedRowId !== null && !selectedRow) {
      setSelectedRowId(null)
      onSelectedRowChange?.(null)
    }
  }, [selectedRow, selectedRowId, onSelectedRowChange])

  useEffect(() => {
    const nextSelectedRows = dataSource?.filter((item) => selectedRowIds.includes(item.id)) ?? []
    if (nextSelectedRows.length !== selectedRowIds.length) {
      const nextIds = nextSelectedRows.map((item) => item.id)
      setSelectedRowIds(nextIds)
      onSelectedRowsChange?.(nextSelectedRows)
    }
  }, [dataSource, onSelectedRowsChange, selectedRowIds])

  const defaultOnRow: NonNullable<TableProps<T>['onRow']> = (record) => ({
    onClick: (event) => {
      const target = event.target as HTMLElement
      if (target.closest('.ant-table-selection-column')) {
        return
      }

      navigate(`/${apiPath}/${record.id}`)
    },
    style: { cursor: 'pointer' },
  })

  const normalizedRowSelection: TableProps<T>['rowSelection'] =
    rowSelection ??
    (enableSingleSelect || enableCreateEditActions
      ? {
          type: enableSingleSelect ? 'radio' : 'checkbox',
          columnWidth: 64,
          selectedRowKeys: enableSingleSelect
            ? selectedRowId
              ? [selectedRowId]
              : []
            : selectedRowIds,
          onChange: (selectedRowKeys) => {
            const normalizedKeys = selectedRowKeys
              .map((key) => (typeof key === 'number' ? key : null))
              .filter((key): key is number => key !== null)

            if (enableSingleSelect) {
              const selectedKey = normalizedKeys[0]
              const nextSelectedRow = dataSource?.find((item) => item.id === selectedKey) ?? null
              const nextSelectedRowId = nextSelectedRow?.id ?? null
              setSelectedRowId(nextSelectedRowId)
              onSelectedRowChange?.(nextSelectedRow)
              setSelectedRowIds(nextSelectedRowId ? [nextSelectedRowId] : [])
              onSelectedRowsChange?.(nextSelectedRow ? [nextSelectedRow] : [])
              return
            }

            const nextSelectedRows = dataSource?.filter((item) => normalizedKeys.includes(item.id)) ?? []
            setSelectedRowIds(normalizedKeys)
            onSelectedRowsChange?.(nextSelectedRows)
            if (normalizedKeys.length === 1) {
              setSelectedRowId(normalizedKeys[0])
              onSelectedRowChange?.(nextSelectedRows[0] ?? null)
            } else {
              setSelectedRowId(null)
              onSelectedRowChange?.(null)
            }
          },
        }
      : undefined)

  const createLabel = actions?.createLabel ?? 'Create'
  const editLabel = actions?.editLabel ?? 'Edit'
  const deleteLabel = actions?.deleteLabel ?? 'Delete'
  const showCreate = actions?.showCreate ?? true
  const showEdit = actions?.showEdit ?? true
  const showDelete = actions?.showDelete ?? true
  const apiEntityPath = apiPath.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())

  const deleteMutation = useMutation({
    mutationFn: async (entityIds: number[]) => {
      await Promise.all(entityIds.map((entityId) => deleteJson(`${apiEntityPath}/${entityId}`)))
    },
    onSuccess: async () => {
      setSelectedRowId(null)
      setSelectedRowIds([])
      onSelectedRowChange?.(null)
      onSelectedRowsChange?.([])
      await queryClient.invalidateQueries({ queryKey: [apiEntityPath] })
      message.success('Record deleted')
    },
    onError: (error: Error) => {
      message.error(`Unable to delete record: ${error.message}`)
    },
  })

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {enableCreateEditActions ? (
        <Space>
          {showCreate ? (
            <Button type="primary" onClick={() => navigate(`/${apiPath}/edit`)}>
              {createLabel}
            </Button>
          ) : null}
          {showEdit ? (
            <Button
              disabled={enableSingleSelect ? !selectedRow : selectedRows.length !== 1}
              onClick={() =>
                navigate(`/${apiPath}/edit`, {
                  state: {
                    entity: enableSingleSelect ? selectedRow : selectedRows[0],
                  },
                })
              }
            >
              {editLabel}
            </Button>
          ) : null}
          {showDelete ? (
            <Popconfirm
              title="Delete selected record?"
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
              disabled={enableSingleSelect ? !selectedRow : selectedRows.length === 0}
              onConfirm={() => {
                const idsToDelete = enableSingleSelect
                  ? selectedRow
                    ? [selectedRow.id]
                    : []
                  : selectedRows.map((item) => item.id)
                if (idsToDelete.length > 0) {
                  deleteMutation.mutate(idsToDelete)
                }
              }}
            >
              <Button
                danger
                disabled={
                  (enableSingleSelect ? !selectedRow : selectedRows.length === 0) || deleteMutation.isPending
                }
              >
                {deleteLabel}
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ) : null}

      <Table<T>
        className="entity-list-table"
        rowKey={rowKey ?? 'id'}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        onRow={onRow ?? defaultOnRow}
        rowSelection={normalizedRowSelection}
        pagination={pagination ?? { pageSize: 8 }}
        scroll={scroll ?? { x: 900 }}
      />
    </Space>
  )
}
