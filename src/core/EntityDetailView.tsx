import { Button, Card, Descriptions, Popconfirm, Space, Tooltip, Typography } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { EntityBase } from '../types/entities'

const { Text, Title } = Typography

export type DetailFieldConfig<T extends EntityBase> = {
  key: string
  label: string
  render: (entity: T | undefined) => ReactNode
}

export type EntityDetailActionsConfig<T extends EntityBase> = {
  onEdit?: (entity: T) => void
  onDelete?: (entity: T) => void
  isDeleting?: boolean
  editLabel?: string
  deleteLabel?: string
  deleteConfirmTitle?: string
  deleteConfirmDescription?: string
}

type EntityDetailViewProps<T extends EntityBase> = {
  entityName: string
  backTo?: {
    label: string
    to: string
  }
  title: string
  invalidMessage?: string
  invalid?: boolean
  errorMessage?: string
  error?: Error | null
  data?: T
  isLoading?: boolean
  fields: DetailFieldConfig<T>[]
  actions?: EntityDetailActionsConfig<T>
  children?: ReactNode
}

export function EntityDetailView<T extends EntityBase>({
  entityName,
  backTo,
  title,
  invalidMessage,
  invalid,
  errorMessage,
  error,
  data,
  isLoading,
  fields,
  actions,
  children,
}: EntityDetailViewProps<T>) {
  if (invalid) {
    return <Text type="danger">{invalidMessage ?? `Invalid ${entityName} id.`}</Text>
  }

  if (error) {
    return <Text type="danger">{errorMessage ?? `Unable to load ${entityName}`}: {error.message}</Text>
  }

  const editLabel = actions?.editLabel ?? 'Edit'
  const deleteLabel = actions?.deleteLabel ?? 'Delete'
  const deleteConfirmTitle = actions?.deleteConfirmTitle ?? `Delete this ${entityName}?`
  const deleteConfirmDescription =
    actions?.deleteConfirmDescription ?? 'This action cannot be undone.'

  return (
    <Space direction="vertical" size={16} className="entity-page">
      {backTo ? <Link to={backTo.to}>{backTo.label}</Link> : null}
      <Card loading={isLoading}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {actions ? (
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {actions.onEdit ? (
                <Tooltip title={editLabel}>
                  <Button
                    shape="circle"
                    icon={<EditOutlined />}
                    aria-label={editLabel}
                    onClick={() => {
                      if (data) {
                        actions.onEdit?.(data)
                      }
                    }}
                    disabled={!data}
                  />
                </Tooltip>
              ) : null}
              {actions.onDelete ? (
                <Popconfirm
                  title={deleteConfirmTitle}
                  description={deleteConfirmDescription}
                  okText={deleteLabel}
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: actions.isDeleting }}
                  onConfirm={() => {
                    if (data) {
                      actions.onDelete?.(data)
                    }
                  }}
                  disabled={!data}
                >
                  <Tooltip title={deleteLabel}>
                    <Button
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      aria-label={deleteLabel}
                      disabled={!data || actions.isDeleting}
                    />
                  </Tooltip>
                </Popconfirm>
              ) : null}
            </Space>
          ) : null}

          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          <Descriptions bordered column={1} size="middle">
            {fields.map((field) => (
              <Descriptions.Item key={field.key} label={field.label}>
                {field.render(data)}
              </Descriptions.Item>
            ))}
          </Descriptions>

          {children}
        </Space>
      </Card>
    </Space>
  )
}
