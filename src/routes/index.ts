import express, { Router } from 'express'
import path from 'path'
import fileRouter from './files'
import userRouter from './user'
import productRouter from './product'
import categoryRouter from './category'
import sectionRouter from './section'
import unitRouter from './unit'
import measurementRouter from './measurement'
import branchRouter from './branch'
import requestRouter from './request'
import typeRouter from './type'
import applicationRouter from './application'
import applicationStateRouter from './application_state'
import marketingRouter from './marketing'
import offerRouter from './offer'
import purchaseRouter from './purchase'
import requirementRouter from './requirement'
import purchaseStateRouter from './purchase_state'
import notificationRouter from './notification'
import commissionRouter from './commission'
import contractRouter from './contract'
import contractStateRouter from './contract_state'
import kpiRouter from './kpi'
import monitoringRouter from './monitoring'
import companyRouter from './company'

const router = Router({ mergeParams: true })

router.use('/api/file', express.static(path.join(__dirname, '../../../uploads')))
router.use('/file', fileRouter)
router.use('/user', userRouter)
router.use('/product', productRouter)
router.use('/category', categoryRouter)
router.use('/section', sectionRouter)
router.use('/unit', unitRouter)
router.use('/measurement', measurementRouter)
router.use('/branch', branchRouter)
router.use('/request', requestRouter)
router.use('/type', typeRouter)
router.use('/application', applicationRouter)
router.use('/application-state', applicationStateRouter)
router.use('/marketing', marketingRouter)
router.use('/offer', offerRouter)
router.use('/purchase', purchaseRouter)
router.use('/requirement', requirementRouter)
router.use('/purchase-state', purchaseStateRouter)
router.use('/notification', notificationRouter)
router.use('/commission', commissionRouter)
router.use('/contract', contractRouter)
router.use('/kpi', kpiRouter)
router.use('/monitoring', monitoringRouter)
router.use('/contract-state', contractStateRouter)
router.use('/company', companyRouter)

export default router
