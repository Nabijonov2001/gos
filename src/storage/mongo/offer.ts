import { OfferRepo } from '../repo/offer'
import Offer, { IOffer } from '../../models/Offer'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class OfferStorage implements OfferRepo {
    private scope = 'storage.offer'

    async find(query: Object): Promise<IOffer[]> {
        try {
            const offers = await Offer.find(query)

            return offers
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IOffer> {
        try {
            const offer = await Offer.findOne(query)

            if (!offer) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'offer_404')
            }

            return offer
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IOffer): Promise<IOffer> {
        try {
            const offer = await Offer.create(payload)

            return offer
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IOffer): Promise<IOffer> {
        try {
            const offer = await Offer.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!offer) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'offer_404')
            }

            return offer
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IOffer> {
        try {
            const offer = await Offer.findOneAndDelete(query)

            if (!offer) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'offer_404')
            }

            return offer
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
