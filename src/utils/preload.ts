// 将window对象暴露给preload.js

import { MongoClient } from "mongodb";
import fs from 'fs';
// 设置不检查
/* eslint-disable */
declare global {
  interface Window {
    preload: {
      createMongoDB: (connectionString: string) => MongoClient;
      readFileAsync: (filePath: string, encoding: string) => Promise<string>;
      writeFileAsync: (filePath: string, data: string, encoding: string) => Promise<void>;
      writeFileStream: (filePath: string, flag: string, encoding: string, autoClose: boolean) => fs.WriteStream;
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
      
      showSaveDialog: (options: {filters: Array<{name?: string, extensions?: Array<string>}>,properties?: Array<string>,title?: string,defaultPath?: string}) => Promise<any>;
      showOpenDialog: (options: {filters: Array<{name?: string, extensions?: Array<string>}>,properties?: Array<string>,title?: string,defaultPath?: string}) => Promise<any>;
    }
  }
}

const createMongoDB : (connectionString: string) => MongoClient = window.preload.createMongoDB;

const dbStorage = window.utools.dbStorage;

const db = window.utools.db;

const showSaveDialog = window.utools.showSaveDialog;

const showOpenDialog = window.utools.showOpenDialog;

const readFileAsync = window.preload.readFileAsync;

const writeFileAsync = window.preload.writeFileAsync;

const writeFileStream = window.preload.writeFileStream;

export { createMongoDB,
  dbStorage,
  db,
  showSaveDialog,
  showOpenDialog,
  readFileAsync,
  writeFileAsync,
  writeFileStream };
