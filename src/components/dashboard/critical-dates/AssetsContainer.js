import React, { Component } from "react"
import { connect } from "react-redux"
import { Spin, Table, DatePicker, Typography, Switch, Checkbox, Popover, Button, Select } from "antd"
import moment from "moment"
import { Scrollbars } from "react-custom-scrollbars"
import { fetchAssetsByOption, saveOptionAsset, saveOptionAssetChanges, saveOptionAssetSetup, updateAssetSchedule } from "../../../actions/assets"
import { Status, DateFormat, StatusInfoColor, ProjectStartMode } from "./shared"
import StatusInfoPopoverContent from "./StatusInfo"

import { ReactComponent as JobPendingIcon } from "../../../assets/icons/brand/job-status-pending.svg"
import { ReactComponent as JobActiveIcon } from "../../../assets/icons/brand/job-status-active.svg"
import { ReactComponent as InfoIconSmall } from "../../../assets/icons/brand/info-icon-16x16.svg"
import { ReactComponent as InfoIconLarge } from "../../../assets/icons/brand/info-icon-24x24.svg"

const { Text } = Typography
const { Option } = Select

const getState = state => {
    return {
        assets: state.assets,
        scheduleGroup: state.criticalDates.scheduleGroup
    }
}

const getActions = dispatch => {
    return {
        fetchAssetsByOption: option => dispatch(fetchAssetsByOption(option)),
        saveOptionAsset: option => dispatch(saveOptionAsset(option)),
        saveOptionAssetChanges: option => dispatch(saveOptionAssetChanges(option)),
        saveOptionAssetSetup: option => dispatch(saveOptionAssetSetup(option)),
        updateAssetSchedule: opt => dispatch(updateAssetSchedule(opt))
    }
}

class AssetsContainer extends Component {
    constructor(props) {
        super(props)

        this.getCustomHeader = this.getCustomHeader.bind(this)

        this.state = {

        }
    }

    componentDidMount() {
        this.props.fetchAssetsByOption(this.getCurrentOption())
    }

    getCurrentOption() {
        const { siteId, assetTypeId, complianceId, optionId, optionKey } = this.props
        return {
            siteId: siteId,
            assetTypeId: assetTypeId,
            complianceId: complianceId,
            optionId: optionId,
            key: optionKey
        }
    }

    onSelectAsset(asset, e) {
        const opt = this.getCurrentOption()
        opt.assetId = asset.assetId
        opt.isChecked = e.target.checked

        this.props.saveOptionAsset(opt)
    }

    onAssetLastDateChange(assetId, isLastProcessInProgress, date, dateString) {
        const opt = this.getCurrentOption()
        opt.assetId = assetId

        if (date) {
            opt.lastDate = dateString
            opt.isLastProcessInProgress = isLastProcessInProgress

            this.props.saveOptionAssetChanges(opt)
        }
    }

    onAssetInProgressChange(assetId, date, isLastProcessInProgress) {
        const opt = this.getCurrentOption()
        opt.assetId = assetId
        opt.lastDate = date
        opt.isLastProcessInProgress = isLastProcessInProgress

        this.props.saveOptionAssetChanges(opt)
    }

    componentWillUnmount() {

    }

    onAssetSetupDone(assetId) {
        const opt = this.getCurrentOption();
        opt.assetId = assetId
        opt.isSetupDone = true

        this.props.saveOptionAssetSetup(opt)
    }
    getCustomHeaderPopoverContent(content) {
        return content &&
            <Scrollbars autoHeight
                autoHeightMax={250}>
                <span>{content}</span>
            </Scrollbars>;
    }

    getCustomHeaderPopoverTitle(title) {
        return <>
            <InfoIconLarge className="icon" /> {title}
        </>;
    }
    getCustomHeader(headerName, headerDetails, defaultName) {
        if (!this.props.isContainer) {
            if (this.props.optionDetails.projectStartModeId === 1 && headerName) {
                return <div className="custom-header">
                    <Popover overlayClassName={`info-popover ${(headerDetails ? '' : 'no-content')}`} placement="top"
                        title={this.getCustomHeaderPopoverTitle(headerName)}
                        content={this.getCustomHeaderPopoverContent(headerDetails)} trigger="click">
                        <InfoIconSmall className={`icon-svg description-popover`} />
                    </Popover>
                    <span>{headerName}</span>
                </div>
            }
            else {
                return defaultName
            }
        } else {
            return ""
        }
    }

    onScheduleChange(assetId, customerAssetId, e) {
        const opt = this.getCurrentOption()
        opt.assetId = assetId
        opt.scheduleId = e
        opt.scheduleSequenceId = null
        opt.customerComplianceOptionAssetId = customerAssetId

        this.props.updateAssetSchedule(opt)
    }

    onScheduleSequenceChange(assetId, customerAssetId, scheduleId, e) {
        const opt = this.getCurrentOption()
        opt.assetId = assetId
        opt.scheduleId = scheduleId
        opt.scheduleSequenceId = e
        opt.customerComplianceOptionAssetId = customerAssetId

        this.props.updateAssetSchedule(opt)
    }

    getSelectedSchedule(sequenceId, groupId) {
        let selectedSchedule = null

        if (sequenceId && this.props.scheduleGroup[groupId]) {
            this.props.scheduleGroup[groupId].forEach(g => {
                if (g.scheduleSequences && g.scheduleSequences.some(s => s.id === sequenceId)) {
                    selectedSchedule = g.id
                    return;
                }
            });
        }

        return selectedSchedule
    }

    render() {
        const option = this.props.assets[this.props.optionKey]

        const columns = [{
            className: "ant-col-11",
            title: "",
            dataIndex: "",
            key: "",
            width: "50px",
            render: (value, asset, index) => {
                let isDisabled = asset.statusId > Status.Ready
                if (this.props.isContainer && this.props.containerData.statusId <= Status.Ready &&
                    asset.statusId === Status.PendingJobSetup
                ) {
                    isDisabled = false
                }
                asset.onChange = this.onSelectAsset.bind(this, asset)

                return <Checkbox checked={asset.isChecked} disabled={isDisabled} onChange={asset.onChange} className="asset-checkbox" />
            }
        },
        {
            className: "asset-name",
            title: "Asset",
            dataIndex: "name",
            key: "assetId",
        },
        {
            title: this.getCustomHeader(this.props.optionDetails.lastDateHeaderName, this.props.optionDetails.lastDateDetails, "Last Date"),
            className: "ant-col-4",
            dataIndex: "",
            key: "",
            render: (value, asset, index) => {
                if (asset.isChecked && !this.props.isContainer && asset.statusId <= Status.Ready) {
                    if (this.props.optionDetails.projectStartModeId === ProjectStartMode.RefDate) {
                        asset.onLastDateChange = this.onAssetLastDateChange.bind(this, asset.assetId, asset.isLastProcessInProgress)
                        return <>{(asset.isChecked &&
                            <DatePicker allowClear={false} defaultValue={(asset.lastDate && moment(asset.lastDate)) || undefined}
                                onChange={asset.onLastDateChange} format={DateFormat} />) || ""
                        }</>
                    }

                    if (this.props.optionDetails.projectStartModeId === ProjectStartMode.Schedule) {
                        asset.onScheduleChange = this.onScheduleChange.bind(this, asset.assetId, asset.customerComplianceOptionAssetId)

                        return <>{(asset.isChecked &&
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                placeholder="Select a schedule"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                value={asset.scheduleId}
                                onChange={asset.onScheduleChange}
                            >
                                {this.props.scheduleGroup[this.props.optionDetails.scheduleGroupId] &&
                                    this.props.scheduleGroup[this.props.optionDetails.scheduleGroupId]
                                        .map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>) || ""
                        }</>
                    }
                }
            }
        },
        {
            title: this.getCustomHeader(this.props.optionDetails.stillInProgressHeaderName, this.props.optionDetails.stillInProgressDetails, "Still in Progress"),
            className: "asset-last-in-progress ant-col-4",
            dataIndex: "",
            key: "",
            render: (value, asset, index) => {
                if (asset.isChecked && !this.props.isContainer && asset.statusId <= Status.Ready) {
                    if (this.props.optionDetails.projectStartModeId === ProjectStartMode.RefDate) {
                        asset.onAssetInProgressChange = this.onAssetInProgressChange.bind(this, asset.assetId, asset.lastDate)

                        return <Switch disabled={!asset.lastDate} checkedChildren="Yes" unCheckedChildren="No"
                            onChange={asset.onAssetInProgressChange} checked={asset.isLastProcessInProgress} />
                    }

                    if (this.props.optionDetails.projectStartModeId === ProjectStartMode.Schedule) {
                        asset.onScheduleSequenceChange = this.onScheduleSequenceChange.bind(this, asset.assetId, asset.customerComplianceOptionAssetId, asset.scheduleId)

                        let sequences = []

                        if (this.props.scheduleGroup[this.props.optionDetails.scheduleGroupId]) {
                            const schedule = this.props.scheduleGroup[this.props.optionDetails.scheduleGroupId].find(g => g.id === asset.scheduleId)

                            if (schedule) {
                                sequences = schedule.scheduleSequences
                            }
                        }

                        return <>{(asset.isChecked &&
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                placeholder="Select a schedule"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                value={asset.scheduleSequenceId}
                                onChange={asset.onScheduleSequenceChange}
                            >
                                {sequences.map(s => <Option key={s.id} value={s.id}>
                                    {`(${s.sequenceNumber}) ${moment(s.startDate).format(DateFormat)} - ${moment(s.noLaterThanDate).format(DateFormat)}`}
                                </Option>)}
                            </Select>) || ""
                        }</>
                    }
                }
            }
        },
        {
            className: "asset-status__text ant-col-5",
            title: "Status",
            dataIndex: "",
            key: "",
            render: (value, asset, index) => {
                const statusInfoContent = <StatusInfoPopoverContent
                    customerComplianceOptionId={asset.customerComplianceOptionId}
                    customerComplianceOptionAssetId={asset.customerComplianceOptionAssetId}
                    config={this.props.config}></StatusInfoPopoverContent>

                if ((!this.props.isContainer && asset.statusId === Status.Ready) ||
                    (this.props.isContainer && this.props.containerData.statusId > Status.Ready && asset.statusId === Status.Ready)
                ) {
                    asset.onSetupDone = this.onAssetSetupDone.bind(this, asset.assetId)

                    return <button type="button" disabled={asset.isSetupSaving}
                        className="btn btn-success confirm-btn " onClick={asset.onSetupDone}>
                        Confirm{asset.isSetupSaving ? "..." : ""}
                    </button>
                }

                return <>
                    {asset.isChecked &&
                        <>
                            <Text className={(asset.colorId === StatusInfoColor.Green ? "active" : "")}>
                                {!this.props.isContainer && asset.statusId < Status.Ready ? asset.status : ""}
                            </Text>
                            {((!this.props.isContainer && asset.statusId > Status.Ready) ||
                                (this.props.isContainer && asset.statusId === Status.PendingJobSetup && this.props.containerData.statusId > Status.PendingJobSetup)) &&
                                <Popover trigger="click" content={statusInfoContent} placement="leftTop" destroyTooltipOnHide={true} overlayClassName="status-popover">
                                    <Button style={{ padding: 0 }} type="link" ghost >
                                        {(asset.colorId === StatusInfoColor.Green ? <JobActiveIcon /> : <JobPendingIcon />)}
                                    </Button>
                                </Popover>}
                        </>}
                </>
            }
        }]

        return <div>
            {option && <Spin spinning={option.isLoading} size="large">
                <div>
                    <Table className="assets" size="small" rowKey={record => record.assetId}
                        columns={columns} dataSource={option.assets} pagination={false} scroll={{ y: 220 }} />
                </div>
            </Spin>}
        </div>
    }
}

export default connect(
    getState,
    getActions,
)(AssetsContainer)
