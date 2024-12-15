import { MongoClient } from 'mongodb';
import { createMongoDB } from '@/utils/preload';
import { Driver, DB } from '@/core/driver';
import { Field, FieldType } from '@/utils/field';
import { message } from 'antd';

console.log(FieldType.String);



// 添加一个连接池
const connectionPool = new Map<string, DB>();
const connectionPoolLock = new Map<string, boolean>();


// 退出时，关闭所有连接
window.addEventListener("beforeunload", async () => {
    for (const db of connectionPool.values()) {
        await db.close();
    }
});


class MongoDBDriver implements Driver {
    name: string = "mongodb";

    

    async connect(name: string,connectionString: string,fields: Map<string, string>): Promise<DB | null> {
        if (connectionPoolLock.get(name)) {
            return connectionPool.get(name) || null;
        }
        connectionPoolLock.set(name, true);
        let db = new MongoDB(this, name,connectionString,fields);
        if (await db.connect()) {
            connectionPool.set(name, db);
            return db;
        }
        return null;
    }
    supportFields(): Field[] {
        return [
            { key: "host", type: FieldType.String ,default: "localhost", required: true},
            { key: "port", type: FieldType.Number ,default: 27017, required: true},
            { key: "username", type: FieldType.String ,default: "", required: true},
            { key: "password", type: FieldType.String ,default: "", required: true},
            { key: "database", type: FieldType.String ,default: "admin", required: false},
            { key: "authSource", type: FieldType.String ,default: "admin", required: true},
        ];
    }
    getConnectionStringPlaceholder(): string {
        return "mongodb://username:password@host:port/database?authSource=authSource";
    }

}   
class MongoDB implements DB {
    db: MongoClient;
    connectionString: string;
    driver: Driver;
    name: string;
    _isConnected: boolean = false;
    fields: Map<string, string>;

    default_database: string = "admin";

    constructor(driver: Driver, name: string,connectionString: string,fields: Map<string, string>) {
        this.name = name;
        this.connectionString = connectionString;
        if (connectionString.length === 0) {
            this.connectionString = `mongodb://${fields.get("username")}:${fields.get("password")}@${fields.get("host")}:${fields.get("port")}`;
        }
        this.db = createMongoDB(this.connectionString);
        this.driver = driver;
        this.fields = fields;
        if (fields.get("database") === "") {
            this.default_database = fields.get("database") || this.default_database;
        }
    }


    async close(): Promise<void> {
        this.db.close();
        connectionPool.delete(this.name);
        connectionPoolLock.delete(this.name);
    }

    async getDatabases(): Promise<string[]> {
        return await this.db.db().admin().listDatabases().then((res) => res.databases.map((db) => db.name));
    }
    async tables(dbName: string): Promise<string[]> {
        return await this.db.db(dbName).collections().then((res) => res.map((table) => table.collectionName));
    }
   
    isConnected(): boolean {
        return this._isConnected;
    }

    async connect(): Promise<boolean> {
        if (this._isConnected) {
            return true;
        }
        try {
            await this.db.connect();
            this._isConnected = true;
            return true;
        } catch (error) {
            message.error((error as Error).message);
            return false;
        }
    }

    async query(dbName: string, sql: string): Promise<any> {
        const collection = this.db.db(dbName);
        return await collection.runCursorCommand({find: sql});
    }
    async execute(dbName: string, sql: string): Promise<any> {
        const collection = this.db.db(dbName);
        return await collection.runCursorCommand({execute: sql});
    }
    getDriver(): Driver {
        return this.driver;
    }
   
    async insert(dbName: string, table: string, row: any): Promise<void> {
        const collection = this.db.db(dbName).collection(table);
        await collection.insertOne(row);
    }
    async update(dbName: string, table: string, where: any, row: any): Promise<void> {
        const collection = this.db.db(dbName).collection(table);
        await collection.updateOne(where, row);
    }
    async delete(dbName: string, table: string, where: any): Promise<void> {
        const collection = this.db.db(dbName).collection(table);
        await collection.deleteOne(where);
    }
    async getColumns(dbName: string, table: string): Promise<string[]> {
        const collection = this.db.db(dbName).collection(table);
        const res = await collection.findOne({});
        if (res) {
            return Object.keys(res);
        }
        return [];
    }

    async getTableData(dbName: string, table: string,where: any = {},limit: number = 30,skip: number = 0,order_type: string = "asc",order_field: string = "_id"): Promise<{data: any[], total: number}> {
        if (where === undefined) {
            where = {};
        }
        // 如果where是字符串，则转换为对象
        if (typeof where === 'string') {
            if (where == "") {
                where = {};
            } else {
                where = JSON.parse(where);
            }
        }
        console.log(where);
        const collection = this.db.db(dbName).collection(table);
        const count = await collection.countDocuments(where);
        return {
            data: await collection.find(where).sort({[order_field]: order_type === "asc" ? 1 : -1}).limit(limit).skip(skip).toArray(),
            total: count
        };
    }
 
}

export {MongoDBDriver, MongoDB};