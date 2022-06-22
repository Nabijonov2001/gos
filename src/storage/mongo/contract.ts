import { ContractRepo } from '../repo/contract'
import Contract, { IContract } from '../../models/Contract'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ContractStorage implements ContractRepo {
    private scope = 'storage.contract'

    async find(query: Object): Promise<IContract[]> {
        try {
            const contracts = await Contract.find(query)

            return contracts
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IContract> {
        try {
            const contract = await Contract.findOne(query)

            if (!contract) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'contract_404')
            }

            return contract
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IContract): Promise<IContract> {
        try {
            const contract = await Contract.create(payload)

            return contract
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IContract): Promise<IContract> {
        try {
            const contract = await Contract.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!contract) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'contract_404')
            }

            return contract
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IContract> {
        try {
            const contract = await Contract.findOneAndDelete(query)

            if (!contract) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'contract_404')
            }

            return contract
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
