import { IPurchaseState } from '../../models/PurchaseState'

export interface PurchaseStateRepo {
    find(query: Object, page?: number): Promise<IPurchaseState[]>
    findOne(query: Object): Promise<IPurchaseState>
    create(payload: IPurchaseState): Promise<IPurchaseState>
    update(query: Object, payload: IPurchaseState): Promise<IPurchaseState>
    updateMany(query: Object, payload: IPurchaseState | Object): Promise<Object>
    delete(query: Object): Promise<IPurchaseState>
}
