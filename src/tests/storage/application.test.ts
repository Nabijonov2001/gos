import { IApplication } from '../../models/Application'
import { ApplicationStorage } from '../../storage/mongo/application'
import Database from '../../core/db'

const storage = new ApplicationStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.category', () => {
    const application = {
        _id: '8bf5fc5c-0558-408c-a12f-95dca952a56',
        description: 'This is description',
        product_name: 'Product',
        measure_unit: 'kg',
        cipher_code: '1030010000000000',
        application_code: 100100
    }
    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca95408c'

    test('Create new category: succes', () => {
        return storage.create(application as IApplication).then((data) => {
            expect(data._id).toEqual(application._id)
            expect(data.product_name).toEqual(application.product_name)
        })
    })

    test('Get all category: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one category: success', () => {
        return storage.findOne({ _id: application._id }).then((data) => {
            expect(data._id).toEqual(application._id)
            expect(data.product_name).toEqual(application.product_name)
        })
    })

    test('Get one category: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update category: success', () => {
        const product_name = 'Product name is updated'
        return storage.update(application._id, { product_name } as IApplication).then((data) => {
            expect(data._id).toEqual(application._id)
            expect(data.product_name).toEqual(product_name)
        })
    })

    test('Get update category: fail', () => {
        const product_name = 'Product name is not updated'
        return storage.update(fake_id, { product_name } as IApplication).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete category: succes', () => {
        return storage.delete(application._id).then((data) => {
            expect(data._id).toEqual(application._id)
        })
    })

    test('Get delete category: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
