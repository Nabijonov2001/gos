import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IMarketing extends Document {
    _id: string
    is_new: boolean
    status: string
    application: string
    user: string
    market_researcher: string
    date: {
        from: string
        till: string
    }
    offers: string[]
    offer_price: number
    research_status: string
    trading_platform: string
    sent_at: number
}

const marketingSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        is_new: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            enum: ['on_marketing', 'marketing_ended', 'sent', 'remarketing', 'canceled'],
            default: 'on_marketing'
        },
        application: {
            type: String,
            ref: 'Application',
            required: true
        },
        user: {
            type: String,
            ref: 'User',
            required: true
        },
        market_researcher: {
            type: String,
            ref: 'User',
            required: true
        },
        date: {
            from: {
                type: Date,
                required: true
            },
            till: {
                type: Date,
                required: true
            }
        },
        offers: {
            type: [String],
            ref: 'Offer'
        },
        offer_price: {
            type: Number
        },
        research_status: {
            type: String,
            enum: ['received', 'sent', 'disapproved', 'remarketing', 'canceled'],
            default: 'received'
        },
        trading_platform: {
            type: String,
            enum: ['cooperuz', 'tender', 'direct', 'tanlov', 'emagazin', 'auction']
        },
        sent_at: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IMarketing>('Marketing', marketingSchema)
