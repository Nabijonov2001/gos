import { IWarehouse } from '../../models/Warehouse'
import { WarehouseStorage } from '../../storage/mongo/warehouse'
import Database from '../../core/db'

const storage = new WarehouseStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.warehouse', () => {
    const warehouse = {
        _id: '38b8acbf-c1db-4341-a2fd-2302ba977d6c',
        name: "Tashmi",
        branch: 'r6b8acbf-c1db-4341-a2fd-2302ba977dl0',
        cipher_code: '01'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new warehouse: succes', () => {
        return storage.create(warehouse as IWarehouse).then((data) => {
            expect(data._id).toEqual(warehouse._id)
        })
    })

    test('Get all warehouse: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one warehouse: success', () => {
        return storage.findOne({ _id: warehouse._id }).then((data) => {
            expect(data._id).toEqual(warehouse._id)
        })
    })

    test('Get one warehouse: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update warehouse: success', () => {
        const name = "Yuqori Tashmi"
        return storage.update(warehouse._id, { name } as IWarehouse).then((data) => {
            expect(data._id).toEqual(warehouse._id)
            expect(data.name).toEqual(name)
        })
    })

    test('Get update warehouse: fail', () => {
        const name = 'Quyi Tashmi'

        return storage.update(fake_id, { name } as IWarehouse).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete warehouse: succes', () => {
        return storage.deleteMany({}).then((data: any) => {
            expect(data.deletedCount > 0).toBeTruthy()
        })
    })
})
