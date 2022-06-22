import { BidderRepo } from '../repo/bidder'
import Bidder, { IBidder } from '../../models/Bidder'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class BidderStorage implements BidderRepo {
    private scope = 'storage.bidder'

    async find(query: Object): Promise<IBidder[]> {
        try {
            const bidders = await Bidder.find(query)

                .populate([
                    { path: 'requirement_operation.requirement' },
                    { path: 'requirement_operation.commissions.id', select: { full_name: 1 } }
                ])
                .sort({ createdAt: -1 })

            return bidders
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IBidder> {
        try {
            const bidder = await Bidder.findOne(query)

            if (!bidder) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'bidder_404')
            }

            return bidder
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IBidder): Promise<IBidder> {
        try {
            const bidder = await Bidder.create(payload)

            return bidder
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IBidder | Object): Promise<IBidder> {
        try {
            const bidder = await Bidder.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!bidder) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'bidder_404')
            }

            return bidder
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IBidder> {
        try {
            const bidder = await Bidder.findOneAndDelete(query)

            if (!bidder) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'bidder_404')
            }

            return bidder
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
