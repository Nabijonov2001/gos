import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IRequirement } from '../models/Requirement'

export interface IPurchase extends Document {
    _id: string
    is_new: boolean
    application: string
    marketing: string
    method: string
    selected_user: string
    user: string
    date: {
        from: string
        till: string
    }
    status: string
    requirement_adder: string
    requirements: string[] | IRequirement[]
    main_requirement: string
    technical_share: string
    price_share: string
    min_score: string
    operator: string
    purchase_date: {
        from: string
        till: string
    }
    platform_date: {
        from: string
        till: string
        end: string
    }
    platform_url: string
}

const purchaseSchema = new Schema(
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
        method: {
            type: String,
            enum: ['cooperuz', 'tender', 'tanlov', 'direct', 'auction', 'emagazin'],
            required: true
        },
        selected_user: {
            type: String,
            ref: 'User'
        },
        user: {
            type: String,
            ref: 'User',
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
                '41',
                '42',
                '51',
                '52',
                'remarketing',
                'canceled',
                'contract'
            ],
            default: '01'
        },
        requirement_adder: {
            type: String,
            ref: 'User'
        },
        requirements: {
            type: [String],
            ref: 'Requirement'
        },
        main_requirement: {
            type: String,
            enum: ['price', 'score']
        },
        technical_share: {
            type: Number
        },
        price_share: {
            type: Number
        },
        min_score: {
            type: Number
        },
        operator: {
            type: String,
            ref: 'User'
        },
        purchase_date: {
            from: {
                type: Date
            },
            till: {
                type: Date
            }
        },
        platform_date: {
            from: {
                type: Date
            },
            till: {
                type: Date
            },
            end: {
                type: Date
            }
        },
        platform_url: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IPurchase>('Purchase', purchaseSchema)
