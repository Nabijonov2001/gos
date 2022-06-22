import { IResponse } from '../../models/Response'

export interface ResponseRepo {
    find(query: Object): Promise<IResponse[]>
    findOne(query: Object): Promise<IResponse>
    create(payload: IResponse): Promise<IResponse>
    insertMany(payload: IResponse[]): Promise<Object>
    update(query: Object, payload: IResponse): Promise<IResponse>
    delete(query: Object): Promise<IResponse>
}
