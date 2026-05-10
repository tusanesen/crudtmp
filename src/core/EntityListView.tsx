import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, Checkbox, Modal, Popconfirm, Space, Table, Tooltip, Typography, message } from 'antd'
import type { TableProps } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { deleteJson } from '../api/apiClient'
import type { EntityBase } from '../types/entities'

type EntityModalRenderer<TArgs> = {
  title: string
  width?: number
  render: (args: TArgs) => ReactNode
}

type EntityListDetailContext<T extends EntityBase> = {
  detail?: EntityModalRenderer<
    {
      entityId: number
      close: () => void
      openEdit: (entity: T) => void
    }
  >
  edit?: EntityModalRenderer<
    {
      entity: T
      close: () => void
    }
  >
  create?: EntityModalRenderer<
    {
      close: () => void
    }
  >
}

type EntityListViewProps<T extends EntityBase> = {
  apiPath: string
  columns: TableProps<T>['columns']
  sortableColumns?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'date'
      defaultOrder?: 'ascend' | 'descend'
      compare?: (a: T, b: T) => number
      value?: (record: T) => string | number | boolean | Date | null | undefined
    }
  >
  dataSource: TableProps<T>['dataSource']
  loading?: TableProps<T>['loading']
  onRow?: TableProps<T>['onRow']
  rowSelection?: TableProps<T>['rowSelection']
  enableSingleSelect?: boolean
  onSelectedRowChange?: (selectedRow: T | null) => void
  onSelectedRowsChange?: (selectedRows: T[]) => void
  enableCreateEditActions?: boolean
  onCreateAction?: () => void
  onEditAction?: (selectedRow: T) => void
  detailContext?: EntityListDetailContext<T>
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

type ColumnConfig<T extends EntityBase> = {
  id: string
  title: string
  column: NonNullable<TableProps<T>['columns']>[number]
  visible: boolean
}

const { Text } = Typography

export function EntityListView<T extends EntityBase>(props: EntityListViewProps<T>) {
  const {
    apiPath,
    columns,
    sortableColumns,
    dataSource,
    loading,
    onRow,
    rowSelection,
    enableSingleSelect,
    onSelectedRowChange,
    onSelectedRowsChange,
    enableCreateEditActions,
    onCreateAction,
    onEditAction,
    detailContext,
    actions,
    rowKey,
    pagination,
    scroll,
  } = props
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([])
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const [detailEntityId, setDetailEntityId] = useState<number | null>(null)
  const [editingEntity, setEditingEntity] = useState<T | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const enhancedColumns = useMemo<NonNullable<TableProps<T>['columns']>>(() => {
    const baseColumns = (columns ?? []) as NonNullable<TableProps<T>['columns']>

    return baseColumns.map((column) => {
      const key =
        typeof column.key === 'string' || typeof column.key === 'number'
          ? String(column.key)
          : Array.isArray(column.dataIndex)
            ? column.dataIndex.join('.')
            : typeof column.dataIndex === 'string'
              ? column.dataIndex
              : null

      if (!key) {
        return column
      }

      const sortConfig = sortableColumns?.[key]
      if (!sortConfig) {
        return column
      }

      const getValue = (record: T) => {
        if (sortConfig.value) {
          return sortConfig.value(record)
        }

        const dataIndex = column.dataIndex
        if (typeof dataIndex === 'string') {
          return (record as Record<string, unknown>)[dataIndex] as
            | string
            | number
            | boolean
            | Date
            | null
            | undefined
        }

        if (Array.isArray(dataIndex)) {
          return dataIndex.reduce<unknown>((acc, part) => {
            if (acc && typeof acc === 'object') {
              return (acc as Record<string, unknown>)[String(part)]
            }
            return undefined
          }, record) as string | number | boolean | Date | null | undefined
        }

        return undefined
      }

      const defaultCompare = (a: T, b: T) => {
        const valueA = getValue(a)
        const valueB = getValue(b)

        if (valueA == null && valueB == null) {
          return 0
        }
        if (valueA == null) {
          return -1
        }
        if (valueB == null) {
          return 1
        }

        if (sortConfig.type === 'number') {
          return Number(valueA) - Number(valueB)
        }

        if (sortConfig.type === 'boolean') {
          return Number(Boolean(valueA)) - Number(Boolean(valueB))
        }

        if (sortConfig.type === 'date') {
          return new Date(String(valueA)).getTime() - new Date(String(valueB)).getTime()
        }

        return String(valueA).localeCompare(String(valueB))
      }

      return {
        ...column,
        sorter: sortConfig.compare ?? defaultCompare,
        defaultSortOrder: sortConfig.defaultOrder,
      }
    })
  }, [columns, sortableColumns])

  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig<T>[]>(() =>
    enhancedColumns.map((column, index) => {
      const rawId =
        typeof column.key === 'string' || typeof column.key === 'number'
          ? column.key
          : Array.isArray(column.dataIndex)
            ? column.dataIndex.join('.')
            : column.dataIndex
      return {
        id: String(rawId ?? `column-${index}`),
        title: typeof column.title === 'string' ? column.title : `Column ${index + 1}`,
        column,
        visible: true,
      }
    }),
  )

  const selectedRow = useMemo(
    () => dataSource?.find((item) => item.id === selectedRowId) ?? null,
    [dataSource, selectedRowId],
  )
  const selectedRows = useMemo(
    () => dataSource?.filter((item) => selectedRowIds.includes(item.id)) ?? [],
    [dataSource, selectedRowIds],
  )
  const selectedSingleRow = useMemo(
    () => (enableSingleSelect ? selectedRow : selectedRows[0] ?? null),
    [enableSingleSelect, selectedRow, selectedRows],
  )

  const visibleColumns = useMemo(
    () => columnConfigs.filter((item) => item.visible).map((item) => item.column),
    [columnConfigs],
  )

  useEffect(() => {
    setColumnConfigs((current) => {
      const nextBase = enhancedColumns.map((column, index) => {
        const rawId =
          typeof column.key === 'string' || typeof column.key === 'number'
            ? column.key
            : Array.isArray(column.dataIndex)
              ? column.dataIndex.join('.')
              : column.dataIndex
        return {
          id: String(rawId ?? `column-${index}`),
          title: typeof column.title === 'string' ? column.title : `Column ${index + 1}`,
          column,
        }
      })

      if (current.length === 0) {
        return nextBase.map((item) => ({ ...item, visible: true }))
      }

      const currentById = new Map(current.map((item) => [item.id, item]))
      return nextBase.map((item) => {
        const existing = currentById.get(item.id)
        return {
          ...item,
          visible: existing?.visible ?? true,
        }
      })
    })
  }, [enhancedColumns])

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

      if (detailContext?.detail) {
        setDetailEntityId(record.id)
        return
      }

      navigate(`/${apiPath}/${record.id}`)
    },
    style: { cursor: 'pointer' },
  })

  const closeDetailModal = () => setDetailEntityId(null)
  const closeEditModal = () => setEditingEntity(null)
  const closeCreateModal = () => setIsCreateModalOpen(false)

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
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Tooltip title="Columns">
            <Button
              shape="circle"
              icon={<SettingOutlined />}
              aria-label="Columns"
              onClick={() => setIsColumnsModalOpen(true)}
            />
          </Tooltip>
          {showCreate ? (
            <Tooltip title={createLabel}>
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                aria-label={createLabel}
                onClick={() => {
                  if (onCreateAction) {
                    onCreateAction()
                    return
                  }

                  if (detailContext?.create) {
                    setIsCreateModalOpen(true)
                    return
                  }

                  navigate(`/${apiPath}/edit`, { state: { returnTo: location.pathname } })
                }}
              />
            </Tooltip>
          ) : null}
          {showEdit ? (
            <Tooltip title={editLabel}>
              <Button
                shape="circle"
                icon={<EditOutlined />}
                aria-label={editLabel}
                disabled={enableSingleSelect ? !selectedRow : selectedRows.length !== 1}
                onClick={() => {
                  if (!selectedSingleRow) {
                    return
                  }

                  if (onEditAction) {
                    onEditAction(selectedSingleRow)
                    return
                  }

                  if (detailContext?.edit) {
                    setEditingEntity(selectedSingleRow)
                    return
                  }

                  navigate(`/${apiPath}/edit`, {
                    state: {
                      entity: selectedSingleRow,
                      returnTo: location.pathname,
                    },
                  })
                }}
              />
            </Tooltip>
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
              <Tooltip title={deleteLabel}>
                <Button
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  aria-label={deleteLabel}
                  disabled={
                    (enableSingleSelect ? !selectedRow : selectedRows.length === 0) ||
                    deleteMutation.isPending
                  }
                />
              </Tooltip>
            </Popconfirm>
          ) : null}
        </Space>
      ) : null}

      <Table<T>
        className="entity-list-table"
        rowKey={rowKey ?? 'id'}
        columns={visibleColumns}
        dataSource={dataSource}
        loading={loading}
        onRow={onRow ?? defaultOnRow}
        rowSelection={normalizedRowSelection}
        pagination={pagination ?? { pageSize: 8 }}
        scroll={scroll ?? { x: 900 }}
      />

      <Modal
        title={detailContext?.detail?.title}
        open={detailEntityId !== null}
        onCancel={closeDetailModal}
        footer={null}
        destroyOnClose
        width={detailContext?.detail?.width ?? 900}
      >
        {detailEntityId !== null && detailContext?.detail
          ? detailContext.detail.render({
              entityId: detailEntityId,
              close: closeDetailModal,
              openEdit: (entity) => {
                closeDetailModal()
                setEditingEntity(entity)
              },
            })
          : null}
      </Modal>

      <Modal
        title={detailContext?.create?.title}
        open={isCreateModalOpen}
        onCancel={closeCreateModal}
        footer={null}
        destroyOnClose
        width={detailContext?.create?.width ?? 900}
      >
        {isCreateModalOpen && detailContext?.create
          ? detailContext.create.render({ close: closeCreateModal })
          : null}
      </Modal>

      <Modal
        title={detailContext?.edit?.title}
        open={editingEntity !== null}
        onCancel={closeEditModal}
        footer={null}
        destroyOnClose
        width={detailContext?.edit?.width ?? 900}
      >
        {editingEntity && detailContext?.edit
          ? detailContext.edit.render({
              entity: editingEntity,
              close: closeEditModal,
            })
          : null}
      </Modal>

      <Modal
        title="Manage Columns"
        open={isColumnsModalOpen}
        onCancel={() => setIsColumnsModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {columnConfigs.map((item) => (
            <div
              key={item.id}
              className="column-config-row"
              draggable
              onDragStart={() => setDraggedColumnId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!draggedColumnId || draggedColumnId === item.id) {
                  return
                }

                setColumnConfigs((current) => {
                  const sourceIndex = current.findIndex((column) => column.id === draggedColumnId)
                  const targetIndex = current.findIndex((column) => column.id === item.id)
                  if (sourceIndex < 0 || targetIndex < 0) {
                    return current
                  }

                  const next = [...current]
                  const [moved] = next.splice(sourceIndex, 1)
                  next.splice(targetIndex, 0, moved)
                  return next
                })
              }}
              onDragEnd={() => setDraggedColumnId(null)}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size={10}>
                  <HolderOutlined style={{ color: '#6b7280', cursor: 'grab' }} />
                  <Text>{item.title}</Text>
                </Space>
                <Checkbox
                  checked={item.visible}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setColumnConfigs((current) =>
                      current.map((column) =>
                        column.id === item.id ? { ...column, visible: checked } : column,
                      ),
                    )
                  }}
                />
              </Space>
            </div>
          ))}
        </Space>
      </Modal>
    </Space>
  )
}
