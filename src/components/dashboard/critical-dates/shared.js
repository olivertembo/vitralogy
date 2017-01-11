export const Status = Object.freeze({
    PendingDataEntry: 1,
    PendingAssetSelection: 2,
    Ready: 3,
    PendingJobSetup: 4,
    JobActive: 5,
})

export const StatusInfoColor = Object.freeze({
    Green: 1,
    Orange: 2,
})

export const DateFormat = "M/D/YYYY"

export const InspectionType = Object.freeze({
    SelfPerformed: 1,
    ServiceProvider: 2,
    VendorNotFound: 3
})

export const ProjectStartMode = Object.freeze({
    RefDate: 1,
    Schedule: 2,
    Trigger: 3
})