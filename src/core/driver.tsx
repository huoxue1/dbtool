import { Field } from '@/utils/field';
// 一个Driver的接口，需要实现给一个连接字符串，返回一个DB的功能




interface Driver {
    connect(name: string,connectionString: string,fields: Map<string, string>): Promise<DB | null>;
    name: string;

    // 额外需要的字段。key和类型
    supportFields(): Field[];

    getConnectionStringPlaceholder(): string;

}

// 一个DB的接口，需要实现一些数据库操作的功能
interface DB {
    close(): void;
    connect(): Promise<boolean>;
    execute(dbName:string, sql: string): any;
    query(dbName: string, sql: string): any;
    getDriver(): Driver;
    getColumns(dbName: string, table: string): Promise<string[]>;
    getDatabases(): Promise<string[]>;
    tables(dbName: string): Promise<string[]>;
    insert(dbName: string, table: string, row: any): void;
    update(dbName: string, table: string,where: any, row: any): void;
    delete(dbName: string, table: string, where: any): void;
    isConnected(): boolean;
    getTableData(dbName: string, table: string,where: any ,limit: number,skip: number,order_type: string,order_field: string ): Promise<{data: any[], total: number}>;
}

export {  Driver, DB };
