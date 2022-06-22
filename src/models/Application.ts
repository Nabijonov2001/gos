import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { ICategory } from './Category'
import { ISection } from './Section'
import { IUnit } from './Unit'
import { IUser } from './User'

export interface IApplication extends Document {
    _id: string
    application_code: number
    user: string | IUser
    files: {
        original_name: string
        unique_name: string
    }[]
    description: string
    product_name: string
    type: string
    category: string | ICategory
    sections: string[] | ISection[]
    units: string[] | IUnit[]
    measure_unit: string
    quantity: number
    status: string
    method: string
    cipher_code: string
    sent_at: Date
    finishedAt:Date
}

const applicationSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        application_code: {
            type: Number,
            required: true
        },
        user: {
            type: String,
            ref: 'User',
            required: true
        },
        files: [
            {
                original_name: {
                    type: String,
                    required: true
                },
                unique_name: {
                    type: String,
                    required: true
                }
            }
        ],
        description: {
            type: String,
            max: 200,
            required: true
        },
        product_name: {
            type: String,
            max: 50,
            required: true
        },
        type: {
            type: String,
            ref: 'Type',
            required: true
        },
        category: {
            type: String,
            ref: 'Category',
            required: true
        },
        sections: {
            type: [String],
            ref: 'Section',
            required: true
        },
        units: {
            type: [String],
            ref: 'Unit',
            required: true
        },
        measure_unit: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: [
                'not_sent',
                'sent',
                'approved',
                'disapproved',
                'canceled',
                'accepted',
                'marketing',
                'purchasing',
                'contract',
                'finished'
            ],
            default: 'not_sent'
        },
        method: {
            type: String,
            enum: ['cooperuz', 'tender', 'tanlov', 'direct', 'emagazin', 'auction']
        },
        cipher_code: {
            type: String,
            required: true
        },
        sent_at: {
            type: Date
        },
        finishedAt:{
            type:Date
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IApplication>('Application', applicationSchema)
