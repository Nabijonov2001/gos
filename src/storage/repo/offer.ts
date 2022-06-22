import { IOffer } from '../../models/Offer'

export interface OfferRepo {
    find(query: Object): Promise<IOffer[]>
    findOne(query: Object): Promise<IOffer>
    create(payload: IOffer): Promise<IOffer>
    update(query: Object, payload: IOffer): Promise<IOffer>
    delete(query: Object): Promise<IOffer>
}
