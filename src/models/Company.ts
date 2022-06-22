import { string } from 'joi'
import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ICompany extends Document {
    _id: string
    company_name: string
    company_address: string
    company_director: string
    files: {
        original_name: string
        unique_name: string
    }[]
    bank_name: string
    bank_address: string
    bank_account: number
    bank_mfo: string
    bank_inn: string
    bank_okro: string
}

const companySchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    company_name: {
        type: String,
        unique: true
    },
    company_address: {
        type: String
    },
    company_director: {
        type: String
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
    bank_name: {
        type: String
    },
    bank_address: {
        type: String
    },
    bank_account: {
        type: Number
    },
    bank_mfo: {
        type: String
    },
    bank_inn: {
        type: String
    },
    bank_okro: {
        type: String
    }
})

export default mongoose.model<ICompany>('Company', companySchema)
