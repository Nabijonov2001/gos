import { IRequest } from '../../models/Request'

export interface RequestRepo {
    find(query: Object): Promise<IRequest[]>
    findOne(query: Object): Promise<IRequest>
    create(payload: IRequest): Promise<IRequest>
    delete(query: Object): Promise<IRequest>
}
