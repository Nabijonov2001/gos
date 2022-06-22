import mongoose, { Document, Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IResponse extends Document {
    _id: string
    user: string
    user_type: string
    type: string
    type_id: string
    payment_id: string
    method: string
    text: string
    file: {
        original_name: string
        unique_name: string
    }
    status: string
    products: string[]
}

const responseSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        user: {
            type: String,
            ref: 'User',
            required: true
        },
        user_type: {
            type: String,
            enum: ['user2', 'user3', 'user4', 'user5', 'user9', 'user8', 'user11'],
            required: true
        },
        type: {
            type: String,
            enum: ['application', 'purchase', 'marketing', 'contract'],
            required: true
        },
        type_id: {
            type: String,
            required: true
        },
        payment_id: String,
        method: {
            type: String,
            default: ''
        },
        text: {
            type: String
        },
        file: {
            original_name: {
                type: String,
                default: ''
            },
            unique_name: {
                type: String,
                default: ''
            }
        },
        status: {
            type: String,
            enum: ['approved', 'disapproved', 'ask_sent', 'idle', 'accepted'],
            required: true
        },
        products: {
            type: [String],
            ref: 'Product'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IResponse>('Response', responseSchema)
