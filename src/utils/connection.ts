import { db,dbStorage } from '@/utils/preload';



const connectionStorage = {
    prefix: "connection",
    getItem: (key: string) => {
        return dbStorage.getItem(`${connectionStorage.prefix}-${key}`);
    },
    setItem: (key: string, value: any) => {
        dbStorage.setItem(`${connectionStorage.prefix}-${key}`, value);
    },
    removeItem: (key: string) => {
        dbStorage.removeItem(`${connectionStorage.prefix}-${key}`);
    },
    getAll: () => {
        return db.allDocs(connectionStorage.prefix);
    },
    getALlAsync: async() => {
        return db.promises.allDocs(connectionStorage.prefix);
    }
}

export default connectionStorage;