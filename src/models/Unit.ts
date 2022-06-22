import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IUnit extends Document {
    _id: string
    category: string
    section: string
    name: string
    cipher_code: string
    sup_unit: string
    status: string
}

const unitSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        category: {
            type: String,
            required: true
        },
        section: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        cipher_code: {
            type: String,
            required: true
        },
        sup_unit: {
            type: String
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive'
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IUnit>('Unit', unitSchema)
