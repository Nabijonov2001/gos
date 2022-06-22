import { ISection } from '../../models/Section'
import { SectionStorage } from '../../storage/mongo/section'
import Database from '../../core/db'

const storage = new SectionStorage()

beforeAll(async () => {
    const db = new Database()
    db.connect()
})

describe('Checking storage.section', () => {
    const sections = [
        {
            _id: '8bf5fc5c-0558-408c-a12-5995dca952a0cd',
            name: '200',
            category: '9bf5fc5c-0558-408c-b12f-95dca952a58',
            order: 1
        },
        {
            _id: '2qf5fc5c-0558-408c-a12-5995dca952a0j7',
            name: '600',
            category: '9bf5fc5c-0558-408c-b12f-95dca952a58',
            order: 2
        },
        {
            _id: '4ef5fc5c-0558-408c-a12-5995dca952a0h8',
            name: '1000',
            category: '9bf5fc5c-0558-408c-b12f-95dca952a58',
            order: 3
        }
    ]

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create sections: succes', () => {
        return storage.createMany(sections as ISection[]).then((res: any) => {
            expect(res.length > 0).toBeTruthy()
        })
    })

    test('Get all section: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one section: success', () => {
        return storage.findOne({ _id: sections[0]._id }).then((data) => {
            expect(data._id).toEqual(sections[0]._id)
            expect(data.name).toEqual(sections[0].name)
        })
    })

    test('Get one section: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update section: success', () => {
        const name = '500'
        return storage.update(sections[0]._id, { name } as ISection).then((data) => {
            expect(data._id).toEqual(sections[0]._id)
            expect(data.name).toEqual(name)
        })
    })

    test('Get update section: fail', () => {
        const name = 'Name not updated'
        return storage.update(fake_id, { name } as ISection).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete many sections: sucess', () => {
        return storage.deleteMany({}).then((res: any) => {
            expect(res.deletedCount > 0).toBeTruthy()
        })
    })
})
