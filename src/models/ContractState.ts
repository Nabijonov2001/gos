import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IContract } from './Contract'

export interface IContractState extends Document {
    _id: string
    is_new: boolean
    contract: string | IContract
    user_type: string
    status: string
    user: string
    selected_user: string
    method: string
    payment_id: string
    payment: number
    description: string
    payment_amount: number
    file: {
        original_name: String
        unique_name: String
    }
    payment_date: string
}

const conntractStateSchema = new Schema(
    {
        _id: {
            type: String,
            default: uuidv4
        },
        is_new: {
            type: Boolean,
            default: true
        },
        contract: {
            type: String,
            ref: 'Contract',
            required: true
        },
        user_type: {
            type: String
        },
        status: {
            type: String,
            enum: ['01', '02', '03', '11', '12', '13', '14', '15', '21', '22', '23', '30'],
            default: '01'
        },
        user: {
            type: String,
            ref: 'User'
        },
        selected_user: {
            type: String,
            ref: 'User'
        },
        method: {
            type: String,
            enum: ['cooperuz', 'tender', 'tanlov', 'direct', 'auction', 'emagazin']
        },
        payment_id: {
            type: String
        },
        payment_amount: {
            type: Number
        },
        file: {
            original_name: String,
            unique_name: String
        },
        payment_date: {
            type: Date
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IContractState>('ContractState', conntractStateSchema)
