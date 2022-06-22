import { IWarehouse } from '../../models/Warehouse'

export interface WarehouseRepo {
    find(query: Object, status?: string): Promise<IWarehouse[]>
    findOne(query: Object): Promise<IWarehouse>
    create(payload: IWarehouse): Promise<IWarehouse>
    update(query: Object, payload: IWarehouse): Promise<IWarehouse>
    deleteMany(query: Object): Promise<Object>
}
