import { ICommission } from '../../models/Commission'

export interface CommissionRepo {
    find(query: Object): Promise<ICommission[]>
    findOne(query: Object): Promise<ICommission>
    create(payload: ICommission): Promise<ICommission>
    update(query: Object, payload: ICommission): Promise<ICommission>
    delete(query: Object): Promise<ICommission>
}
