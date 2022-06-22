import { logger } from '../../config/logger'
import Purchase, { IPurchase } from '../../models/Purchase'
import AppError from '../../utils/appError'
import { PurchaseRepo } from '../repo/purchase'

export class PurchaseStorage implements PurchaseRepo {
    private scope = 'storage.purchase'

    async find(query: Object): Promise<IPurchase[]> {
        try {
            const purchases = await Purchase.find(query)
                .populate([
                    {
                        path: 'application',
                        select: 'application_code product_name cipher_code',
                        populate: {
                            path: 'user',
                            populate: { path: 'branches' }
                        }
                    },
                    {
                        path: 'requirement_adder',
                        select: { full_name: 1 }
                    }
                ])
                .sort({ createdAt: -1 })

            return purchases
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IPurchase> {
        try {
            const purchase = await Purchase.findOne(query).populate([
                {
                    path: 'requirements'
                },
                {
                    path: 'requirement_adder'
                },
                {
                    path: 'selected_user'
                },
                {
                    path: 'application',
                    populate: [
                        { path: 'user', populate: [{ path: 'branches', select: { name: 1 } }] },
                        { path: 'sections' },
                        { path: 'units' },
                        { path: 'type' },
                        { path: 'category' }
                    ]
                },
                {
                    path: 'marketing',
                    populate: [{ path: 'offers' }, { path: 'market_researcher' }]
                }
            ])

            if (!purchase) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'purchase_404')
            }

            return purchase
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IPurchase): Promise<IPurchase> {
        try {
            const purchase = await Purchase.create(payload)

            return purchase
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IPurchase): Promise<IPurchase> {
        try {
            const purchase = await Purchase.findOneAndUpdate(query, payload, { new: true })

            if (!purchase) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'purchase_404')
            }

            return purchase
        } catch (error) {
            logger.error(`${this.scope}.findOneAndUpdate: finished with error: ${error}`)
            throw error
        }
    }
}
