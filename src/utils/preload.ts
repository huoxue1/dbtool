// 将window对象暴露给preload.js

import { MongoClient } from "mongodb";

// 设置不检查
/* eslint-disable */
declare global {
  interface Window {
    preload: {
      createMongoDB: (connectionString: string) => MongoClient;
    }
    utools: {
      dbStorage: {
        setItem: (key: string, value: any) => void;
        getItem: (key: string) => any;
        removeItem: (key: string) => void;
      }
      db: {
        promises: {
          allDocs:(key: string|Array<string>|null) => Promise<Array<any>>;
        }
        allDocs:(key: string|Array<string>|null) => Array<any>;
      }
    }
  }
}

const createMongoDB : (connectionString: string) => MongoClient = window.preload.createMongoDB;

const dbStorage = window.utools.dbStorage;

const db = window.utools.db;

export { createMongoDB,dbStorage,db };
