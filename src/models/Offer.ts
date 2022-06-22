import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IOffer extends Document {
    _id: string
    marketing: string
    organization: string
    price: number
    file: {
        original_name: string
        unique_name: string
    }
}

const offerSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        marketing: {
            type: String,
            ref: 'Maketing',
            required: true
        },
        organization: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        file: {
            original_name: {
                type: String,
                required: true
            },
            unique_name: {
                type: String,
                required: true
            }
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IOffer>('Offer', offerSchema)
