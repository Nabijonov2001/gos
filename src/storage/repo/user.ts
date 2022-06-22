import { IUser } from '../../models/User'

export interface UserRepo {
    find(query: Object): Promise<IUser[]>
    findOne(query: Object): Promise<IUser>
    create(payload: IUser): Promise<IUser>
    update(query: Object, payload: IUser): Promise<IUser>
    delete(query: Object): Promise<IUser>
}
