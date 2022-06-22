import { IApplication } from '../../models/Application'

export interface ApplicationRepo {
    find(query: Object, page?: number): Promise<IApplication[]>
    findOne(query: Object): Promise<IApplication>
    create(payload: IApplication): Promise<IApplication>
    update(query: Object, payload: IApplication): Promise<IApplication>
    delete(query: Object): Promise<IApplication>
}
