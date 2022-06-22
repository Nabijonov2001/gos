import { IApplicationState } from '../../models/ApplicationState'

export interface ApplicationStateRepo {
    find(query: Object, page?: number): Promise<IApplicationState[]>
    findOne(query: Object): Promise<IApplicationState>
    create(payload: IApplicationState): Promise<IApplicationState>
    update(query: Object, payload: IApplicationState): Promise<IApplicationState>
    updateMany(query: Object, payload: IApplicationState | Object): Promise<Object>
    delete(query: Object): Promise<IApplicationState>
}
