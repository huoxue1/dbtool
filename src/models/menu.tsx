import { Effect, Reducer } from '@umijs/max';
import { MenuProps, Tooltip, Button, message } from 'antd';
import { DatabaseOutlined, TableOutlined, ReloadOutlined } from '@ant-design/icons';
import connectionStorage from '@/utils/connection';
import { getDriver, supportDriver } from '@/core/core';
import React from 'react';

type MenuItem = Required<MenuProps>['items'][number];

export interface MenuModelState {
  menuItems: MenuItem[];
  expandedKeys: string[];
  selectedKey: string;
  maxLevel: number;
  loadingKeys: Set<string>;
}

export interface MenuModelType {
  namespace: 'menu';
  state: MenuModelState;
  effects: {
    buildMenuItems: Effect;
    loadDatabases: Effect;
    loadTables: Effect;
  };
  reducers: {
    setMenuItems: Reducer<MenuModelState>;
    setExpandedKeys: Reducer<MenuModelState>;
    setSelectedKey: Reducer<MenuModelState>;
    setLoadingKey: Reducer<MenuModelState>;
    updateMaxLevel: Reducer<MenuModelState>;
  };
}

// 修改工具函数，添加刷新按钮
const wrapWithTooltip = (label: string, key: string, onRefresh: (key: string) => void) => {
  return (
    <div className="menu-item-wrapper">
      <Tooltip 
        title={label} 
        placement="right"
        mouseEnterDelay={0.5}
        overlayStyle={{ wordBreak: 'break-all', maxWidth: 300 }}
      >
        <span className="menu-item-label">{label}</span>
      </Tooltip>
      {(key.startsWith('conn/') || key.startsWith('db/')) && (
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          className="menu-item-refresh"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh(key);
          }}
        />
      )}
    </div>
  );
};

const MenuModel: MenuModelType = {
  namespace: 'menu',

  state: {
    menuItems: [],
    expandedKeys: [],
    selectedKey: '',
    maxLevel: 1,
    loadingKeys: new Set(),
  },

  effects: {
    *buildMenuItems(_, { put, select }) {
      const drivers = supportDriver();
      const connections = yield connectionStorage.getALlAsync();
      const items: MenuItem[] = [];

      // 定义刷新处理函数
      const handleRefresh = (key: string) => {
        if (key.startsWith('conn/')) {
          const connectionName = key.replace('conn/', '');
          put({
            type: 'loadDatabases',
            payload: { connectionName },
          });
        } else if (key.startsWith('db/')) {
          const [, connectionName, dbName] = key.split('/');
          put({
            type: 'loadTables',
            payload: { connectionName, dbName },
          });
        }
      };

      for (const driverType of drivers) {
        const driverConnections = connections.filter((conn: any) => 
          conn.value.driver === driverType
        );

        const connectionItems: MenuItem[] = [];
        
        for (const conn of driverConnections) {
          const key = `conn/${conn.value.name}`;
          connectionItems.push({
            key,
            label: wrapWithTooltip(conn.value.name, key, handleRefresh),
            icon: React.createElement(DatabaseOutlined),
            children: [],
          });
        }

        if (connectionItems.length > 0) {
          items.push({
            key: `driver/${driverType}`,
            label: driverType,
            children: connectionItems,
          });
        }
      }

      yield put({
        type: 'setMenuItems',
        payload: items,
      });
    },

    *loadDatabases({ payload: { connectionName } }, { put, select }) {
      const key = `conn/${connectionName}`;
      yield put({ 
        type: 'setLoadingKey', 
        payload: { key, loading: true } 
      });

      try {
        const connectionInfo = connectionStorage.getItem(connectionName);
        const driver = getDriver(connectionInfo.driver);
        const db = yield driver.connect(
          connectionInfo.name, 
          connectionInfo.connectionString, 
          new Map(Object.entries(connectionInfo))
        );
        const databases = yield db.getDatabases();

        const { menuItems } = yield select((state: any) => state.menu);
        const newItems = [...menuItems];

        const handleRefresh = (key: string) => {
          if (key.startsWith('db/')) {
            const [, connName, dbName] = key.split('/');
            put({
              type: 'loadTables',
              payload: { connectionName: connName, dbName },
            });
          }
        };

        const updateMenuChildren = (items: MenuItem[]) => {
          for (const item of items) {
            if (item?.children) {
              updateMenuChildren(item.children);
            }
            if (item?.key === key) {
              item.children = databases.map((db: string) => {
                const key = `db/${connectionName}/${db}`;
                return {
                  key,
                  label: wrapWithTooltip(db, key, handleRefresh),
                  icon: React.createElement(DatabaseOutlined),
                  children: [],
                };
              });
            }
          }
        };

        updateMenuChildren(newItems);
        yield put({
          type: 'setMenuItems',
          payload: newItems,
        });
        
        yield put({
          type: 'updateMaxLevel',
          payload: 2,
        });
      } finally {
        yield put({ 
          type: 'setLoadingKey', 
          payload: { key, loading: false } 
        });
      }
    },

    *loadTables({ payload: { connectionName, dbName } }, { put, select }) {
      const key = `db/${connectionName}/${dbName}`;
      yield put({ 
        type: 'setLoadingKey', 
        payload: { key, loading: true } 
      });

      try {
        const connectionInfo = connectionStorage.getItem(connectionName);
        const driver = getDriver(connectionInfo.driver);
        const db = yield driver.connect(
          connectionInfo.name, 
          connectionInfo.connectionString, 
          new Map(Object.entries(connectionInfo))
        );
        const tables = yield db?.tables(dbName);

        const { menuItems } = yield select((state: any) => state.menu);
        const newItems = [...menuItems];

        const updateMenuChildren = (items: MenuItem[]) => {
          for (const item of items) {
            if (item?.children) {
              updateMenuChildren(item.children);
            }
            if (item?.key === key) {
              item.children = tables.map((table: string) => ({
                key: `table/${connectionName}/${dbName}/${table}`,
                label: wrapWithTooltip(table, `table/${connectionName}/${dbName}/${table}`, () => {}),
                icon: React.createElement(TableOutlined),
              }));
            }
          }
        };

        updateMenuChildren(newItems);
        yield put({
          type: 'setMenuItems',
          payload: newItems,
        });
        
        yield put({
          type: 'updateMaxLevel',
          payload: 3,
        });
      } 
      catch (error) {
        message.error(error.toString());
      }
      finally {
        yield put({ 
          type: 'setLoadingKey', 
          payload: { key, loading: false } 
        });
      }
    },
  },

  reducers: {
    setMenuItems(state, { payload }) {
      return {
        ...state,
        menuItems: payload,
      };
    },

    setExpandedKeys(state, { payload }) {
      return {
        ...state,
        expandedKeys: payload,
      };
    },
    setSelectedKey(state, { payload }) {
      return {
        ...state,
        selectedKey: payload,
      };
    },
    setLoadingKey(state, { payload: { key, loading } }) {
      const newLoadingKeys = new Set(state.loadingKeys);
      if (loading) {
        newLoadingKeys.add(key);
      } else {
        newLoadingKeys.delete(key);
      }
      return {
        ...state,
        loadingKeys: newLoadingKeys,
      };
    },
    updateMaxLevel(state, { payload }) {
      return {
        ...state,
        maxLevel: Math.max(state.maxLevel, payload),
      };
    },
  },
};

export default MenuModel; 