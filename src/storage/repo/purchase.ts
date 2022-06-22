import { IPurchase } from '../../models/Purchase'

export interface PurchaseRepo {
    find(query: Object): Promise<IPurchase[]>
    findOne(query: Object): Promise<IPurchase>
    create(payload: IPurchase): Promise<IPurchase>
    update(query: Object, payload: IPurchase): Promise<IPurchase>
}
