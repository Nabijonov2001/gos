import { IBranch } from '../../models/Branch'

export interface BranchRepo {
    find(query: Object, status?: string): Promise<IBranch[]>
    findOne(query: Object): Promise<IBranch>
    create(payload: IBranch): Promise<IBranch>
    update(query: Object, payload: IBranch): Promise<IBranch>
    delete(query: Object): Promise<IBranch>
}
