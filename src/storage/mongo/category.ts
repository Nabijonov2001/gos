import { CategoryRepo } from '../repo/category'
import Category, { ICategory } from '../../models/Category'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class CategoryStorage implements CategoryRepo {
    private scope = 'storage.category'

    async find(query: Object, status?: string): Promise<ICategory[]> {
        try {
            let categories: ICategory[]

            if (status === 'last') {
                categories = await Category.find(query).sort({ createdAt: -1 }).limit(1)
            } else {
                categories = await Category.find(query).sort({ createdAt: -1 })
            }

            return categories
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ICategory> {
        try {
            const category = await Category.findOne(query)

            if (!category) {
                logger.warn(`${this.scope}.get failed type_id findOne`)
                throw new AppError(404, 'category_404')
            }

            return category
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: ICategory): Promise<ICategory> {
        try {
            const category = await Category.create(payload)

            return category
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: ICategory): Promise<ICategory> {
        try {
            const category = await Category.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!category) {
                logger.warn(`${this.scope}.update failed type_id findOneAndUpdate`)
                throw new AppError(404, 'category_404')
            }

            return category
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<ICategory> {
        try {
            const category = await Category.findOneAndDelete(query)

            if (!category) {
                logger.warn(`${this.scope}.delete failed type_id findOneAndDelete`)
                throw new AppError(404, 'category_404')
            }

            return category
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
