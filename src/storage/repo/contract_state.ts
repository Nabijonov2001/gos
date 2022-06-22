import { IContractState } from '../../models/ContractState'

export interface ContractStateRepo {
    find(query: Object, page?: number): Promise<IContractState[]>
    findOne(query: Object): Promise<IContractState>
    create(payload: IContractState): Promise<IContractState>
    update(query: Object, payload: IContractState): Promise<IContractState>
    delete(query: Object): Promise<IContractState>
    deleteMany(query: Object): Promise<Object>
}
