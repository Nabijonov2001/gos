import { IChat } from '../../models/Chat'

export interface ChatRepo {
    find(query: Object): Promise<IChat[]>
    create(payload: IChat): Promise<IChat>
    deleteMany(query: Object): Promise<Object>
}
