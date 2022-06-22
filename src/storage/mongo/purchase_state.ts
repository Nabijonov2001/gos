import { PurchaseStateRepo } from '../repo/purchase_state'
import PurchaseState, { IPurchaseState } from '../../models/PurchaseState'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class PurchaseStateStorage implements PurchaseStateRepo {
    private scope = 'storage.purchase_state'

    async find(query: Object): Promise<IPurchaseState[]> {
        try {
            const purchase_states = await PurchaseState.find(query)
                .populate([
                    {
                        path: 'application',
                        populate: [
                            { path: 'user', populate: [{ path: 'branches', select: { name: 1 } }] },
                            { path: 'units' }
                        ]
                    },
                    {
                        path: 'marketing',
                        populate: [{ path: 'offers' }]
                    }
                ])
                .sort({ createdAt: -1 })

            return purchase_states
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IPurchaseState> {
        try {
            const purchase_state = await PurchaseState.findOne(query).populate([
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
                },
                {
                    path: 'purchase',
                    populate: [{ path: 'requirements' }, { path: 'requirement_adder' }]
                }
            ])

            if (!purchase_state) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'purchase_state_404')
            }

            return purchase_state
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IPurchaseState): Promise<IPurchaseState> {
        try {
            const purchase_state = await PurchaseState.create(payload)

            return purchase_state
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IPurchaseState): Promise<IPurchaseState> {
        try {
            const purchase_state = await PurchaseState.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!purchase_state) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'purchase_state_404')
            }

            return purchase_state
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IPurchaseState | Object): Promise<Object> {
        try {
            const purchase_states = await PurchaseState.updateMany(query, payload)

            return purchase_states
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IPurchaseState> {
        try {
            const purchase_state = await PurchaseState.findOneAndDelete(query)

            if (!purchase_state) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'purchase_state_404')
            }

            return purchase_state
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
