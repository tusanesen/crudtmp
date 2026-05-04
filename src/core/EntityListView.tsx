import { PureComponent } from 'react'
import { Table } from 'antd'
import type { TableProps } from 'antd'
import type { EntityBase } from '../types/entities'

type EntityListViewProps<T extends EntityBase> = {
  apiPath: string
  columns: TableProps<T>['columns']
  dataSource: TableProps<T>['dataSource']
  loading?: TableProps<T>['loading']
  onRow?: TableProps<T>['onRow']
  rowKey?: TableProps<T>['rowKey']
  pagination?: TableProps<T>['pagination']
  scroll?: TableProps<T>['scroll']
}

export class EntityListView<T extends EntityBase> extends PureComponent<EntityListViewProps<T>> {
  private getDefaultOnRow: NonNullable<TableProps<T>['onRow']> = (record) => ({
    onClick: () => {
      const { apiPath } = this.props
      const nextPath = `/${apiPath}/${record.id}`
      window.history.pushState({}, '', nextPath)
      window.dispatchEvent(new PopStateEvent('popstate'))
    },
    style: { cursor: 'pointer' },
  })

  render() {
    const { apiPath: _apiPath, columns, dataSource, loading, onRow, rowKey, pagination, scroll } =
      this.props

    return (
      <Table<T>
        rowKey={rowKey ?? 'id'}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        onRow={onRow ?? this.getDefaultOnRow}
        pagination={pagination ?? { pageSize: 8 }}
        scroll={scroll ?? { x: 900 }}
      />
    )
  }
}
