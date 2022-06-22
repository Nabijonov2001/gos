import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ICategory extends Document {
    _id: string
    name: string
    type: string
    cipher_code: string
}

const categorySchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true,
            ref: 'Type'
        },
        cipher_code: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICategory>('Category', categorySchema)
