import { MongoDBDriver } from "@/core/mongodb";
import { Driver } from "@/core/driver";

function getDriver(driverName: string): Driver {
    switch (driverName) {
        case 'mongodb':
            return new MongoDBDriver();
        default:
            throw new Error('Driver not found');
    }
}

function supportDriver(): string[] {
    return ['mongodb'];
}

export { getDriver, supportDriver };
