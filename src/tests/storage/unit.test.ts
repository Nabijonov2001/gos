import { IUnit } from '../../models/Unit'
import { UnitStorage } from '../../storage/mongo/unit'
import Database from '../../core/db'

const storage = new UnitStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.unit', () => {
    const unit = {
        _id: '8bf5fc5c-0558-408c-a12-5995dca952a0cd',
        name: 'QUVVATI',
        section: '12f5fc5c-0558-408c-a12-5995dca952a0c4',
        sup_unit: 'h575fc5c-0558-408c-a12-5995dca952a9f6',
        category: 't575fc5c-0558-408c-a12-5995dca952a9j8',
        cipher_code: '01',
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new unit: success', () => {
        return storage.create(unit as IUnit).then((data) => {
            expect(data._id).toEqual(unit._id)
            expect(data.name).toEqual(unit.name)
            expect(data.sup_unit).toEqual(unit.sup_unit)
        })
    })

    test('Get all unit: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one unit: success', () => {
        return storage.findOne({ _id: unit._id }).then((data) => {
            expect(data._id).toEqual(unit._id)
            expect(data.name).toEqual(unit.name)
        })
    })

    test('Get one unit: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update unit: success', () => {
        const name = 'RUSUMI'
        return storage.update(unit._id, { name } as IUnit).then((data) => {
            expect(data._id).toEqual(unit._id)
            expect(data.name).toEqual(name)
        })
    })

    test('Get update unit: fail', () => {
        const name = 'Name not updated'
        return storage.update(fake_id, { name } as IUnit).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete units: succes', () => {
        return storage.deleteMany({}).then((data: any) => {
            expect(data.deletedCount > 0).toBeTruthy()
        })
    })
})
