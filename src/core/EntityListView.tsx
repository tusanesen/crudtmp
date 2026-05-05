import { useEffect, useMemo, useState } from 'react'
import { Button, Space, Table } from 'antd'
import type { TableProps } from 'antd'
import { useNavigate } from 'react-router-dom'
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
  enableCreateEditActions?: boolean
  actions?: {
    createLabel?: string
    editLabel?: string
    showCreate?: boolean
    showEdit?: boolean
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
    enableCreateEditActions,
    actions,
    rowKey,
    pagination,
    scroll,
  } = props
  const navigate = useNavigate()
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

  const selectedRow = useMemo(
    () => dataSource?.find((item) => item.id === selectedRowId) ?? null,
    [dataSource, selectedRowId],
  )

  useEffect(() => {
    if (selectedRowId !== null && !selectedRow) {
      setSelectedRowId(null)
      onSelectedRowChange?.(null)
    }
  }, [selectedRow, selectedRowId, onSelectedRowChange])

  const defaultOnRow: NonNullable<TableProps<T>['onRow']> = (record) => ({
    onClick: () => {
      navigate(`/${apiPath}/${record.id}`)
    },
    style: { cursor: 'pointer' },
  })

  const normalizedRowSelection: TableProps<T>['rowSelection'] =
    rowSelection ??
    (enableSingleSelect
      ? {
          type: 'radio',
          selectedRowKeys: selectedRowId ? [selectedRowId] : [],
          onChange: (selectedRowKeys) => {
            const selectedKey = selectedRowKeys[0]
            const nextSelectedRow = dataSource?.find((item) => item.id === selectedKey) ?? null
            const nextSelectedRowId = nextSelectedRow?.id ?? null
            setSelectedRowId(nextSelectedRowId)
            onSelectedRowChange?.(nextSelectedRow)
          },
        }
      : undefined)

  const createLabel = actions?.createLabel ?? 'Create'
  const editLabel = actions?.editLabel ?? 'Edit'
  const showCreate = actions?.showCreate ?? true
  const showEdit = actions?.showEdit ?? true

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
              disabled={!selectedRow}
              onClick={() =>
                navigate(`/${apiPath}/edit`, {
                  state: {
                    entity: selectedRow,
                  },
                })
              }
            >
              {editLabel}
            </Button>
          ) : null}
        </Space>
      ) : null}

      <Table<T>
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
