import { Effect, Reducer } from '@umijs/max';
import { getDriver } from '@/core/core';
import connectionStorage from '@/utils/connection';

interface TableModelState {
  data: any[];
  columns: any[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  displayMode: 'table' | 'text';
}

interface TableModelType {
  namespace: 'table';
  state: TableModelState;
  effects: {
    fetchTableData: Effect;
  };
  reducers: {
    setData: Reducer<TableModelState>;
    setColumns: Reducer<TableModelState>;
    setPagination: Reducer<TableModelState>;
    setLoading: Reducer<TableModelState>;
    setDisplayMode: Reducer<TableModelState>;
  };
}

const TableModel: TableModelType = {
  namespace: 'table',

  state: {
    data: [],
    columns: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    loading: false,
    displayMode: 'table',
  },

  effects: {
    *fetchTableData({ payload }, { call, put }) {
      const { 
        connectionName, 
        dbName, 
        tableName, 
        page = 1, 
        pageSize = 10, 
        sorter = {}, 
        where = '' 
      } = payload;

      yield put({ type: 'setLoading', payload: true });

      try {
        const connectionInfo = connectionStorage.getItem(connectionName);
        const driver = getDriver(connectionInfo.driver);
        const db = yield driver.connect(
          connectionInfo.name,
          connectionInfo.connectionString,
          new Map(Object.entries(connectionInfo))
        );

        if (!db) {
          throw new Error('Failed to connect to database');
        }

        // 获取并设置列信息
        const columns = yield db.getColumns(dbName, tableName);
        const formattedColumns = columns.map((column: any) => ({
          title: column,
          dataIndex: column,
          key: column,
          sorter: true,
          render: (text: any) => {
            if (text instanceof Date) {
              return text.toLocaleString();
            } else if (typeof text === 'object' && text !== null) {
              if (text._bsontype === 'ObjectId') {
                return `ObjectId("${text.toString()}")`
              }
              return JSON.stringify(text);
            }
            return String(text);
          }
        }));

        yield put({ type: 'setColumns', payload: formattedColumns });

        // 获取并设置表格数据
        const data = yield db.getTableData(
          dbName,
          tableName,
          where,
          pageSize,
          (page - 1) * pageSize,
          sorter.order === 'ascend' ? 'asc' : 'desc',
          sorter.field || '_id'
        );

        yield put({ type: 'setData', payload: data.data });
        yield put({
          type: 'setPagination',
          payload: {
            current: page,
            pageSize,
            total: data.total,
          },
        });
      } finally {
        yield put({ type: 'setLoading', payload: false });
      }
    },
  },

  reducers: {
    setData(state, { payload }) {
      return { ...state, data: payload };
    },
    setColumns(state, { payload }) {
      return { ...state, columns: payload };
    },
    setPagination(state, { payload }) {
      return { ...state, pagination: payload };
    },
    setLoading(state, { payload }) {
      return { ...state, loading: payload };
    },
    setDisplayMode(state, { payload }) {
      return { ...state, displayMode: payload };
    },
  },
};

export default TableModel; 