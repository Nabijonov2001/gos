import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IPurchase } from './Purchase'

export interface IPurchaseState extends Document {
    _id: string
    is_new: boolean
    application: string
    marketing: string
    purchase: string | IPurchase
    user_type: string
    user: string
    method: string
    status: string
}

const purchaseStateSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        is_new: {
            type: Boolean,
            default: true
        },
        application: {
            type: String,
            ref: 'Application',
            required: true
        },
        marketing: {
            type: String,
            ref: 'Marketing',
            required: true
        },
        purchase: {
            type: String,
            ref: 'Purchase',
            required: true
        },
        user_type: {
            type: String,
            required: true
        },
        user: {
            type: String,
            ref: 'User'
        },
        method: {
            type: String,
            enum: ['cooperuz', 'tender', 'tanlov', 'direct', 'auction', 'emagazin'],
            required: true
        },
        status: {
            type: String,
            enum: [
                '01',
                '02',
                '11',
                '12',
                '21',
                '22',
                '23',
                '31',
                '32',
                '33',
                '34',
                '41',
                '42',
                '51',
                '52',
                'contract'
            ],
            default: '01'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPurchaseState>('PurchaseState', purchaseStateSchema)
