import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IBranch } from './Branch'
import { ISection } from './Section'
import { IUnit } from './Unit'

export interface IProduct extends Document {
    _id: string
    type: string
    category: string
    sections: string[] | ISection[]
    units: string[] | IUnit[]
    name: string
    inventor_number: number
    quantity: number
    measure_unit: string
    price: number
    branch: string | IBranch
    warehouse: string
    cipher_code: string
    created_at: string
}

const productSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    type: {
        type: String,
        ref: 'Type'
    },
    category: {
        type: String,
        ref: 'Category'
    },
    sections: {
        type: [String],
        ref: 'Section'
    },
    units: {
        type: [String],
        ref: 'Unit'
    },
    name: {
        type: String,
        required: true
    },
    inventor_number: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    measure_unit: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        ref: 'Branch'
    },
    warehouse: {
        type: String,
        ref: 'Warehouse'
    },
    cipher_code: {
        type: String
    },
    created_at: {
        type: String
    }
})

export default mongoose.model<IProduct>('Product', productSchema)
