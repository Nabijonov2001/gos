import { IPayment } from '../../models/Payment'

export interface PaymentRepo {
    find(query: Object): Promise<IPayment[]>
    findOne(query: Object): Promise<IPayment>
    create(payload: IPayment): Promise<IPayment>
    update(query: Object, payload: IPayment): Promise<IPayment>
    delete(query: Object): Promise<IPayment>
}
