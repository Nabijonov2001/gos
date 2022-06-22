import { CommissionRepo } from '../repo/commission'
import Commission, { ICommission } from '../../models/Commission'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class CommissionStorage implements CommissionRepo {
    private scope = 'storage.commission'

    async find(query: Object): Promise<ICommission[]> {
        try {
            const commissions = await Commission.find(query).populate('user')

            return commissions
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ICommission> {
        try {
            const commission = await Commission.findOne(query).populate('user')

            if (!commission) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'commission_404')
            }

            return commission
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: ICommission): Promise<ICommission> {
        try {
            const commission = await Commission.create(payload)

            return commission
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: ICommission): Promise<ICommission> {
        try {
            const commission = await Commission.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!commission) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'branch_404')
            }

            return commission
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<ICommission> {
        try {
            const commission = await Commission.findOneAndDelete(query)

            if (!commission) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'branch_404')
            }

            return commission
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
