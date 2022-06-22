import { IMarketing } from '../../models/Marketing'

export interface MarketingRepo {
    find(query: Object): Promise<IMarketing[]>
    findOne(query: Object): Promise<IMarketing>
    create(payload: IMarketing): Promise<IMarketing>
    update(query: Object, payload: IMarketing): Promise<IMarketing>
    delete(query: Object): Promise<IMarketing>
}
