import { Modal, Tabs } from 'antd'
import { useState } from 'react'
import type { ReactNode } from 'react'

export type RelationModalConfig = {
  title: string
  width?: number
  render: (close: () => void) => ReactNode
}

export type RelationTabConfig = {
  key: string
  label: string
  render: (handlers: {
    openDetail: (modal: RelationModalConfig) => void
    openEdit: (modal: RelationModalConfig) => void
    openCreate: (modal: RelationModalConfig) => void
  }) => ReactNode
}

type EntityRelationsTabsProps = {
  tabs: RelationTabConfig[]
  initialActiveKey?: string
}

export function EntityRelationsTabs({ tabs, initialActiveKey }: EntityRelationsTabsProps) {
  const [activeTabKey, setActiveTabKey] = useState<string>(initialActiveKey ?? tabs[0]?.key ?? '')
  const [detailModal, setDetailModal] = useState<RelationModalConfig | null>(null)
  const [editModal, setEditModal] = useState<RelationModalConfig | null>(null)
  const [createModal, setCreateModal] = useState<RelationModalConfig | null>(null)

  const closeDetail = () => setDetailModal(null)
  const closeEdit = () => setEditModal(null)
  const closeCreate = () => setCreateModal(null)

  const items = tabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    children: tab.render({
      openDetail: setDetailModal,
      openEdit: setEditModal,
      openCreate: setCreateModal,
    }),
  }))

  return (
    <>
      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={items} />

      <Modal
        title={detailModal?.title}
        open={detailModal !== null}
        onCancel={closeDetail}
        footer={null}
        destroyOnClose
        width={detailModal?.width ?? 900}
      >
        {detailModal ? detailModal.render(closeDetail) : null}
      </Modal>

      <Modal
        title={createModal?.title}
        open={createModal !== null}
        onCancel={closeCreate}
        footer={null}
        destroyOnClose
        width={createModal?.width ?? 900}
      >
        {createModal ? createModal.render(closeCreate) : null}
      </Modal>

      <Modal
        title={editModal?.title}
        open={editModal !== null}
        onCancel={closeEdit}
        footer={null}
        destroyOnClose
        width={editModal?.width ?? 900}
      >
        {editModal ? editModal.render(closeEdit) : null}
      </Modal>
    </>
  )
}
