import { IProduct } from '../../models/Product'
import { ProductStorage } from '../../storage/mongo/product'
import Database from '../../core/db'

const storage = new ProductStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.product', () => {
    const product = {
        _id: '8bf5fc5c-0558-408c-a12-5995dca952a0cd',
        type: 'Materials',
        name: 'A4 List',
        category: '1ef5fc5c-h6d7-7d2a-0fh-5995dca952a0r5',
        units: ['3ef5fc5c-h6d7-7d2a-0fh-5995dca952a04r'],
        inventor_number: 5674382248,
        quantity: 100,
        price: 40000,
        branch: 'k5f5fc5c-h6d7-7d2a-0fh-5995dca952a03g',
        warehouse: 'nbf5fc5c-h6d7-7d2a-0fh-5995dca952a0cd',
        cipher_code: '001'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('it creates new product', () => {
        return storage.create(product as IProduct).then((data) => {
            expect(data._id).toEqual(product._id)
            expect(data.warehouse).toEqual(product.warehouse)
            expect(data.category).toEqual(product.category)
            expect(data.units.length).toEqual(product.units.length)
        })
    })

    test('it returns all posts', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('it returns one product by id', () => {
        return storage.findOne({ _id: product._id }).then((data) => {
            expect(data._id).toEqual(product._id)
            expect(data.name).toEqual(product.name)
            expect(data.cipher_code).toEqual(product.cipher_code)
        })
    })

    test('it fails type_id return one post with fake_id', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('it updates one product', () => {
        const payload = {
            name: 'A5 List',
            quantity: 300
        }

        return storage.update(product._id, payload as IProduct).then((data) => {
            expect(data.name).toEqual(payload.name)
            expect(data.quantity).toEqual(payload.quantity)
        })
    })

    test('it fails type_id update one product with fake_id', () => {
        const payload = {
            name: 'A5 List',
            quantity: 300
        }

        return storage.update(product._id, payload as IProduct).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
