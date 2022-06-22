import { IProduct } from '../../models/Product'

export interface ProductRepo {
    find(query: Object, page?: number): Promise<IProduct[]>
    findOne(query: Object): Promise<IProduct>
    create(payload: IProduct): Promise<IProduct>
    update(query: Object, payload: IProduct): Promise<IProduct>
    updateMany(query: Object, payload: IProduct | Object): Promise<Object>
    deleteMany(query: Object): Promise<Object>
}
