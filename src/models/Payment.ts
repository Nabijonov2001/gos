import { Schema, Document, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IPayment extends Document {
    _id: string
    payment_statement_num: number
    paid_date: string
    payment_amount: number
    file: {
        original_name: string
        unique_name: string
    }
}

const PaymentSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        payment_statement_num: Number,
        paid_date: String,
        file: {
            original_name: String,
            unique_name: String
        }
    },
    {
        timestamps: true
    }
)

export default model<IPayment>('Payment', PaymentSchema)
