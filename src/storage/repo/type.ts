import { IType } from '../../models/Type'

export interface TypeRepo {
    find(query: Object): Promise<IType[]>
    findOne(query: Object): Promise<IType>
    update(query: Object, payload: IType): Promise<IType>
    createMany(payload: IType[]): Promise<Object>
    create(payload: IType): Promise<IType>
}
