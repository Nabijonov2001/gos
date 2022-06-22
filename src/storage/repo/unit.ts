import { IUnit } from '../../models/Unit'

export interface UnitRepo {
    find(query: Object, status?: string): Promise<IUnit[]>
    findOne(query: Object): Promise<IUnit>
    create(payload: IUnit): Promise<IUnit>
    update(query: Object, payload: IUnit): Promise<IUnit>
    updateMany(query: Object, payload: IUnit): Promise<Object>
    deleteMany(query: Object): Promise<Object>
}
