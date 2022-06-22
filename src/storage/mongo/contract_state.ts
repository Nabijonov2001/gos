import { ContractStateRepo } from '../repo/contract_state'
import ContractState, { IContractState } from '../../models/ContractState'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ContractStateStorage implements ContractStateRepo {
    private scope = 'storage.contract_state'

    async find(query: Object): Promise<IContractState[]> {
        try {
            let contract_states = await ContractState.find({ ...query }).populate([
                {
                    path: 'contract',
                    populate: [
                        {
                            path: 'application',
                            populate: [
                                {
                                    path: 'user',
                                    populate: [{ path: 'branches', select: { name: 1 } }]
                                }
                            ]
                        }
                    ]
                }
            ])

            return contract_states
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IContractState> {
        try {
            let contract_state = await ContractState.findOne(query)
                .populate([
                    {
                        path: 'contract',
                        populate: [
                            {
                                path: 'application',
                                populate: [
                                    {
                                        path: 'user',
                                        populate: [{ path: 'branches', select: { name: 1 } }]
                                    },
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
                                populate: [
                                    { path: 'requirements' },
                                    {
                                        path: 'requirement_adder'
                                    }
                                ]
                            },
                            {
                                path: 'payments.payer'
                            },
                            {
                                path: 'company'
                            }
                        ]
                    },
                    {
                        path: 'selected_user'
                    }
                ])
                .sort({ createdAt: -1 })

            if (!contract_state) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'contract_state_404')
            }

            return contract_state
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IContractState): Promise<IContractState> {
        try {
            let contract_state = await ContractState.create(payload)

            return contract_state
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IContractState): Promise<IContractState> {
        try {
            let contract_state = await ContractState.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!contract_state) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'contract_state_404')
            }

            return contract_state
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<any> {
        try {
            let contract_state = await ContractState.findOneAndDelete(query)

            if (!contract_state) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'contract_state_404')
            }

            return contract_state
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }

    async deleteMany(query: Object): Promise<Object> {
        try {
            const contract_states = await ContractState.deleteMany(query)
            return contract_states
        } catch (error) {
            logger.error(`${this.scope}.deleteMany: finished  with error: ${error}`)
            throw error
        }
    }
}
