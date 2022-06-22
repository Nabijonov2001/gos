import { BranchRepo } from '../repo/branch'
import Branch, { IBranch } from '../../models/Branch'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class BranchStorage implements BranchRepo {
    private scope = 'storage.branch'

    async find(query: Object, status?: string): Promise<IBranch[]> {
        try {
            let branches: IBranch[]

            if (status === 'last') {
                branches = await Branch.find(query).sort({ createdAt: -1 }).limit(1)
            } else {
                branches = await Branch.find(query)
            }

            return branches
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IBranch> {
        try {
            const branch = await Branch.findOne(query)

            if (!branch) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'branch_404')
            }

            return branch
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IBranch): Promise<IBranch> {
        try {
            const branch = await Branch.create(payload)

            return branch
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IBranch): Promise<IBranch> {
        try {
            const branch = await Branch.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!branch) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'branch_404')
            }

            return branch
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IBranch> {
        try {
            const branch = await Branch.findOneAndDelete(query)

            if (!branch) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'branch_404')
            }

            return branch
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
