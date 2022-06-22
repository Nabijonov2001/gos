import { IContract } from '../../models/Contract'

export interface ContractRepo {
    find(query: Object): Promise<IContract[]>
    findOne(query: Object): Promise<IContract>
    create(payload: IContract): Promise<IContract>
    update(query: Object, payload: IContract): Promise<IContract>
    delete(query: Object): Promise<IContract>
}
