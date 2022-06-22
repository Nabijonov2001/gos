import { ICategory } from '../../models/Category'

export interface CategoryRepo {
    find(query: Object, status?: string): Promise<ICategory[]>
    findOne(query: Object): Promise<ICategory>
    create(payload: ICategory): Promise<ICategory>
    update(query: Object, payload: ICategory): Promise<ICategory>
    delete(query: Object): Promise<ICategory>
}
