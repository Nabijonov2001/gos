import path from 'path'
import { writeFile } from 'fs/promises'
import { logger } from '../config/logger'

export class Upload {
    static uploadFile = async (doc: Express.Multer.File): Promise<Object> => {
        try {
            const file_path = {
                original_name: doc.originalname,
                unique_name: `files/${Date.now()}-${doc.originalname.replace(/ /g, '_')}`
            }
            await writeFile(
                path.join(__dirname, '../../../uploads', file_path.unique_name),
                doc.buffer
            )

            return file_path
        } catch (error) {
            logger.error(`file uploading: finished with error: ${error}`)
            throw error
        }
    }

    static uploadFiles = async (docs: Express.Multer.File[]): Promise<Object[]> => {
        try {
            let files = []

            for (let doc of docs) {
                const file = {
                    original_name: doc.originalname,
                    unique_name: `files/${Date.now()}-${doc.originalname.replace(/ /g, '_')}`
                }

                await writeFile(
                    path.join(__dirname, '../../../uploads', file.unique_name),
                    doc.buffer
                )
                files.push(file)
            }

            return files
        } catch (error) {
            logger.error(`file uploading: finished with error: ${error}`)
            throw error
        }
    }
}
