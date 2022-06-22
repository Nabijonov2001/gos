import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { unlink } from 'fs/promises'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import AppError from '../utils/appError'
import { Upload } from '../helpers/upload'
import { IContractState } from '../models/ContractState'
import { IContract } from '../models/Contract'

export class ContractController {
    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { status, removed_files, company } = req.body
        const contract_state = await storage.contract_state.findOne({
            contract: req.params.id,
            user: id
        })
        let contract = contract_state.contract as IContract
        if (contract_state.status !== '01') {
            return next(new AppError(400, 'contract_update_400'))
        }

        // checking company
        await storage.company.findOne({ _id: company })

        const doc_files = req.files as Express.Multer.File[]
        req.body.contract_files = []

        if (doc_files?.length) {
            req.body.contract_files = await Upload.uploadFiles(doc_files)
        }

        if (removed_files?.length) {
            for (const removed_file of removed_files) {
                await unlink(path.join(__dirname, '../../../uploads', `${removed_file}`))
                contract.contract_files = contract.contract_files.filter(
                    (el: any) => el.unique_name !== removed_file
                )
            }
        }

        req.body.contract_files = contract.contract_files.concat(req.body.contract_files)

        contract = await storage.contract.update({ _id: req.params.id }, req.body)

        if (status) {
            const user3_contract_state = await storage.contract_state.findOne({
                contract: req.params.id,
                user_type: 'user3'
            })

            contract_state.status = status
            await contract_state.save()

            //Rasmiylashtirilganga o`tish qismi
            user3_contract_state.status = '03'
            await user3_contract_state.save()

            // To`lovga o`tish qismi
            await storage.contract_state.create({
                contract: user3_contract_state.contract,
                user: user3_contract_state.user,
                user_type: 'user3',
                method: user3_contract_state.method,
                status: '11'
            } as IContractState)

            // Yetkazib berishga o`tish qismi
            await storage.contract_state.create({
                contract: user3_contract_state.contract,
                user: user3_contract_state.user,
                user_type: 'user3',
                method: user3_contract_state.method,
                status: '21'
            } as IContractState)
        }

        res.status(200).json({
            success: true,
            data: {
                contract
            }
        })
    })
}
