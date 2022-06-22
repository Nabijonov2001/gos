import { IBidder } from '../../models/Bidder'

export interface BidderRepo {
    find(query: Object): Promise<IBidder[]>
    findOne(query: Object): Promise<IBidder>
    create(payload: IBidder): Promise<IBidder>
    update(query: Object, payload: IBidder): Promise<IBidder>
    delete(query: Object): Promise<IBidder>
}
