import { logger } from '../../config/logger'
import Marketing, { IMarketing } from '../../models/Marketing'
import AppError from '../../utils/appError'
import { MarketingRepo } from '../repo/marketing'

export class MarketingStorage implements MarketingRepo {
    private scope = 'storage.marketing'

    async find(query: Object): Promise<IMarketing[]> {
        try {
            const methods = [
                {
                    path: 'application',
                    select: 'application_code product_name cipher_code',
                    populate: {
                        path: 'user',
                        populate: { path: 'branches', select: { name: 1 } }
                    }
                },
                {
                    path: 'market_researcher'
                }
            ]
            let marketings = await Marketing.find({ ...query, is_new: false })
                .populate(methods)
                .sort({ 'date.till': 1 })

            const new_marketings = await Marketing.find({ is_new: true })
                .populate(methods)
                .sort({ createdAt: -1 })

            marketings.unshift(...new_marketings)

            return marketings
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IMarketing> {
        try {
            const marketing = await Marketing.findOne(query).populate([
                {
                    path: 'application',
                    populate: [
                        { path: 'user', populate: [{ path: 'branches', select: { name: 1 } }] },
                        { path: 'type' },
                        { path: 'category' },
                        { path: 'sections' },
                        { path: 'units' }
                    ]
                },
                {
                    path: 'offers'
                },
                {
                    path: 'market_researcher'
                }
            ])

            if (!marketing) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'marketing_404')
            }

            return marketing
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IMarketing): Promise<IMarketing> {
        try {
            const marketing = await Marketing.create(payload)

            return marketing
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IMarketing | Object): Promise<IMarketing> {
        try {
            const marketing = await Marketing.findOneAndUpdate(query, payload, { new: true })

            if (!marketing) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'marketing_404')
            }

            return marketing
        } catch (error) {
            logger.error(`${this.scope}.findOneAndUpdate: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IMarketing> {
        try {
            const marketing = await Marketing.findOneAndDelete(query)

            if (!marketing) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'marketing_404')
            }

            return marketing
        } catch (error) {
            logger.error(`${this.scope}.findOneAndDelete: finished with error: ${error}`)
            throw error
        }
    }
}
