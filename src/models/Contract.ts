import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
export interface Payment {
    payment_id: string
    payer: string
    payment_statement_num: string
    paid_date: string
    payment_amount: number
    description: string
    file: {
        original_name: string
        unique_name: string
    }
}
export interface IContract extends Document {
    _id: string
    application: string
    marketing: string
    purchase: string
    status: string
    files: string[]
    contract_files: {
        original_name: string
        unique_name: string
    }[]
    trust_letter: { original_name: string; unique_name: string }
    contract_number: number
    signed_date: string
    product_name: string
    price: number
    measure_unit: string
    quantity: number
    total_price: number
    residue_price: number
    company: string
    initial_payment: number
    final_payment: number
    delivery_date: string
    shipping_address: string
    payments: [Payment]
    oneCCode: string
}

const contractSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
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
    payments: [
        {
            payment_id: String,
            payer: {
                type: String,
                ref: 'User'
            },
            payment_statement_num: {
                type: String,
                required: true
            },
            paid_date: {
                type: Date
            },
            payment_amount: {
                type: Number,
                required: true
            },
            description: {
                type: String
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
        }
    ],
    oneCCode: {
        type: String
    },
    contract_files: [
        {
            original_name: String,
            unique_name: String
        }
    ],
    trust_letter: {
        original_name: String,
        unique_name: String
    },
    contract_number: {
        type: Number
    },
    signed_date: {
        type: Date
    },
    product_name: {
        type: String
    },
    price: {
        type: Number
    },
    measure_unit: {
        type: String
    },
    quantity: {
        type: Number
    },
    measure: {
        type: String
    },
    total_price: {
        type: Number
    },
    residue_price: {
        type: Number
    },
    company: {
        type: String,
        ref: 'Company'
    },
    initial_payment: {
        type: Number
    },
    provider_mfo: {
        type: String
    },
    final_payment: {
        type: Number
    },
    delivery_date: {
        type: String
    },
    shipping_address: {
        type: String
    }
})

export default mongoose.model<IContract>('Contract', contractSchema)
