import { UserStorage } from './mongo/user'
import { ProductStorage } from './mongo/product'
import { CategoryStorage } from './mongo/category'
import { SectionStorage } from './mongo/section'
import { UnitStorage } from './mongo/unit'
import { BranchStorage } from './mongo/branch'
import { WarehouseStorage } from './mongo/warehouse'
import { RequestStorage } from './mongo/request'
import { ChatStorage } from './mongo/chat'
import { TypeStorage } from './mongo/type'
import { ApplicationStorage } from './mongo/application'
import { ApplicationStateStorage } from './mongo/application_state'
import { ResponseStorage } from './mongo/response'
import { MarketingStorage } from './mongo/marketing'
import { OfferStorage } from './mongo/offer'
import { PurchaseStorage } from './mongo/purchase'
import { RequirementStorage } from './mongo/requirement'
import { PurchaseStateStorage } from './mongo/purchase_state'
import { BidderStorage } from './mongo/bidder'
import { NotificationStorage } from './mongo/notification'
import { CommissionStorage } from './mongo/commission'
import { ContractStorage } from './mongo/contract'
import { ContractStateStorage } from './mongo/contract_state'
import { MeasurementStorage } from './mongo/measurement'
import { CompanyStorage } from './mongo/company'

interface IStorage {
    user: UserStorage
    product: ProductStorage
    category: CategoryStorage
    section: SectionStorage
    unit: UnitStorage
    branch: BranchStorage
    warehouse: WarehouseStorage
    request: RequestStorage
    chat: ChatStorage
    type: TypeStorage
    application: ApplicationStorage
    application_state: ApplicationStateStorage
    response: ResponseStorage
    marketing: MarketingStorage
    offer: OfferStorage
    purchase: PurchaseStorage
    requirement: RequirementStorage
    purchase_state: PurchaseStateStorage
    bidder: BidderStorage
    notification: NotificationStorage
    commission: CommissionStorage
    contract: ContractStorage
    contract_state: ContractStateStorage
    measurement: MeasurementStorage
    company: CompanyStorage
}

export let storage: IStorage = {
    user: new UserStorage(),
    product: new ProductStorage(),
    category: new CategoryStorage(),
    section: new SectionStorage(),
    unit: new UnitStorage(),
    branch: new BranchStorage(),
    warehouse: new WarehouseStorage(),
    request: new RequestStorage(),
    chat: new ChatStorage(),
    type: new TypeStorage(),
    application: new ApplicationStorage(),
    application_state: new ApplicationStateStorage(),
    response: new ResponseStorage(),
    marketing: new MarketingStorage(),
    offer: new OfferStorage(),
    purchase: new PurchaseStorage(),
    requirement: new RequirementStorage(),
    purchase_state: new PurchaseStateStorage(),
    bidder: new BidderStorage(),
    notification: new NotificationStorage(),
    commission: new CommissionStorage(),
    contract: new ContractStorage(),
    contract_state: new ContractStateStorage(),
    measurement: new MeasurementStorage(),
    company: new CompanyStorage()
}
