import React, { Component } from "react"
import { Typography, Row, Col, DatePicker, Spin, Switch, Button, Popover, Collapse, Select } from 'antd';

import moment from "moment"
import { connect } from "react-redux"
import * as api from "../../../constants/api"

import AssetsContainer from "./AssetsContainer"
import CheckboxWrapper from "./Checkbox"
import ConfigSelectionOption from "./ConfigSelectionOption"
import { Status, DateFormat, StatusInfoColor, ProjectStartMode } from "./shared";
import StatusInfoPopoverContent from "./StatusInfo"
import { resetContainerStatus } from "../../../actions/assets";

import { Scrollbars } from "react-custom-scrollbars"

import { ReactComponent as JobPendingIcon } from "../../../assets/icons/brand/job-status-pending.svg"
import { ReactComponent as JobActiveIcon } from "../../../assets/icons/brand/job-status-active.svg"
import { ReactComponent as InfoIconSmall } from "../../../assets/icons/brand/info-icon-16x16.svg"
import { ReactComponent as InfoIconLarge } from "../../../assets/icons/brand/info-icon-24x24.svg"

const { Option } = Select
const { Text } = Typography
const { Panel } = Collapse

const getState = state => {
    return {
        assets: state.assets,
        scheduleGroup: state.criticalDates.scheduleGroup
    }
}

const getActions = dispatch => {
    return {
        resetContainerStatus: key => dispatch(resetContainerStatus(key, {})),
    }
}

export class OptionsContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {}
        const checkedItems = new Map()

        this.onProcessOptionSaved = this.onProcessOptionSaved.bind(this)
        this.onSetupOptionCancel = this.onSetupOptionCancel.bind(this)
        this.updateParent = this.updateParent.bind(this)
        this.saveOption = this.saveOption.bind(this)

        const { siteId, assetTypeId, complianceId } = this.props

        if (props.options) {
            props.options.forEach(o => {
                o.checkboxName = `option-${o.optionId}`
                o.onChange = this.onOptionChange.bind(this, o.optionId)
                o.key = `${siteId}${assetTypeId}${complianceId}${o.optionId}`

                if (o.selections) {
                    o.isChecked = false
                    const selectedOpt = o.selections.find(s => s.isChecked)

                    if (selectedOpt) {
                        o.selectedOption = selectedOpt
                        o.isChecked = true

                        if (selectedOpt.isContainer) {
                            this.initContainerActions(o)

                            this.state.containerData = {
                                ...this.state.containerData,
                                [o.optionId]: {
                                    status: o.selectedOption.status,
                                    statusId: o.selectedOption.statusId,
                                    lastDate: o.selectedOption.lastDate,
                                    isLastProcessInProgress: o.selectedOption.isLastProcessInProgress,
                                    colorId: o.selectedOption.colorId,
                                    customerComplianceOptionId: o.selectedOption.customerComplianceOptionId,
                                }
                            }
                        }
                    }

                    checkedItems.set(o.optionId, o.isChecked)
                }
            })

            this.updateParent(Array.from(checkedItems.values()))
        }

        this.state = {
            ...this.state,
            checkedItems: checkedItems,
            configOptions: {
                showConfigModal: false,
                options: [],
                onProcessOptionSaved: this.onProcessOptionSaved,
                onVendorSaved: this.onVendorSaved,
                onSetupOptionCancel: this.onSetupOptionCancel,
                assetTypeName: this.props.assetTypeName,
                siteId: this.props.siteId,
                assetTypeId: this.props.assetTypeId,
                complianceId: this.props.complianceId
            },
            configAssets: {
                assetTypeName: this.props.assetTypeName,
                siteId: this.props.siteId,
                assetTypeId: this.props.assetTypeId,
                complianceId: this.props.complianceId
            },
            optionsState: {}
        }
    }

    initContainerActions(option) {
        option.selectedOption.onContainerLastDateChange =
            this.onContainerLastDateChange.bind(this, option.selectedOption.classOptionId, option.key, option.optionId)
        option.selectedOption.onSetupDone =
            this.onSetupDone.bind(this, option.selectedOption.classOptionId, option.key, option.optionId)
        option.selectedOption.onContainerInProgressChange =
            this.onContainerInProgressChange.bind(this, option.selectedOption.classOptionId, option.key, option.optionId)
    }

    onSetupOptionCancel() {
        this.setState(prevState => ({
            configOptions: { ...prevState.configOptions, showConfigModal: false }
        }))
    }

    onProcessOptionSaved(optionId, selectedOptionId, optionDetails) {
        let opt = this.props.options.find(x => x.optionId === optionId)
        opt.selectedOption = opt.selections.find(s => s.classOptionId === selectedOptionId)

        if (optionDetails) {
            opt.selectedOption.statusId = optionDetails.StatusId
            opt.selectedOption.status = optionDetails.Status
            opt.selectedOption.lastDate = optionDetails.LastDate
            opt.selectedOption.customerComplianceOptionId = optionDetails.CustomerComplianceOptionId
        }

        this.state.checkedItems.set(optionId, true)

        if (opt.selectedOption.isContainer) {
            this.initContainerActions(opt)

            this.setState(prevState => {
                if (!prevState.containerData) {
                    prevState.containerData = {}
                }
                if (!prevState.containerData[optionId]) {
                    prevState.containerData[optionId] = {}
                }

                return {
                    containerData: {
                        ...prevState.containerData,
                        [optionId]: {
                            ...prevState.containerData[optionId],
                            status: opt.selectedOption.status,
                            statusId: opt.selectedOption.statusId,
                            lastDate: opt.selectedOption.lastDate,
                            customerComplianceOptionId: opt.selectedOption.customerComplianceOptionId
                        }
                    }
                }
            })
        } else {
            this.setState({ checkedItems: this.state.checkedItems })
        }

        this.updateParent(Array.from(this.state.checkedItems.values()))
    }

    saveOption(optionId, selectedOptionId) {
        this.props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${this.props.siteId}/asset-types/${this.props.assetTypeId}/compliances/${this.props.complianceId}/options/${selectedOptionId}?isChecked=true`)
            .then(response => {
                if (response && response.body.IsSuccess) {
                    this.onProcessOptionSaved(optionId, selectedOptionId, response.body)
                }
            })
    }

    onOptionChange(optionId, event) {
        const option = this.props.options.find(o => o.optionId === optionId)

        if (this.props.isCheckedAssetType && this.props.isCheckedCompliance) {
            if (event.target.checked) {
                if (!this.state.checkedItems.get(optionId)) {
                    if (option.selections && option.selections.length === 1) {
                        this.saveOption(optionId, option.selections[0].classOptionId)
                    } else {
                        this.setState(prevState => ({
                            configOptions: {
                                ...prevState.configOptions,
                                options: option.selections,
                                showConfigModal: true,
                                optionId: optionId
                            }
                        }))
                    }
                }
            }
            else {
                let isAnyAssetChecked = false

                if (this.props.assets && this.props.assets[option.key] && this.props.assets[option.key].assets) {
                    isAnyAssetChecked = this.props.assets[option.key].assets.some(a => a.isChecked)
                }

                const { selectedOption } = option

                if (!isAnyAssetChecked && selectedOption) {
                    this.setOptionsState({ [option.key]: { isSavingOption: true } })

                    this.props.config.auth
                        .request("post", `${api.CUSTOMER_API_ROOT}sites/${this.props.siteId}/asset-types/${this.props.assetTypeId}/compliances/${this.props.complianceId}/options/${selectedOption.classOptionId}?isChecked=false`)
                        .then(
                            response => {
                                if (response && response.body.IsSuccess) {
                                    option.selectedOption = null

                                    this.setState(prevState => ({
                                        checkedItems: prevState.checkedItems.set(optionId, false)
                                    }))
                                }

                                this.updateParent(Array.from(this.state.checkedItems.values()))
                                this.setOptionsState({ [option.key]: { isSavingOption: false } })
                            },
                            _ => this.setOptionsState({ [option.key]: { isSavingOption: false } }))
                }
            }
        }
    }

    updateParent(chekedValues) {
        this.props.updateParentContainer(chekedValues.includes(true), `${this.props.assetTypeId}${this.props.complianceId}`)
    }

    setOptionsState(optionState) {
        this.setState(prevState => ({
            optionsState: {
                ...prevState.optionsState,
                ...optionState
            }
        }))
    }

    getOptionDetails(optionId, key) {
        const { siteId, assetTypeId, complianceId } = this.props
        return { siteId, assetTypeId, complianceId, optionId, key }
    }

    onSetupDone(optionClassId, key, optionId) {
        const opt = this.getOptionDetails(optionClassId, key)
        opt.isSetupDone = true

        this.saveSetupDone(opt)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        this.props.resetContainerStatus(key)

                        this.setState(prevState => ({
                            containerData: {
                                ...prevState.containerData,
                                [optionId]: {
                                    ...prevState.containerData[optionId],
                                    status: response.body.Status,
                                    statusId: response.body.StatusId
                                }
                            }
                        }))
                    }

                    this.setOptionsState({ [opt.key]: { isSetupSaving: false } })
                },
                err => this.setOptionsState({ [opt.key]: { isSetupSaving: false } }))
            .catch(err => this.setOptionsState({ [opt.key]: { isSetupSaving: false } }))
    }

    saveSetupDone(params) {
        const { isSetupDone, ...option } = params
        this.setOptionsState({ [option.key]: { isSetupSaving: true } })

        return this.props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}/status`)
            .send({
                IsSetUpDone: isSetupDone
            })
    }

    onContainerInProgressChange(optionClassId, key, optionId, checked) {
        const opt = this.getOptionDetails(optionClassId, key)
        opt.isLastProcessInProgress = checked
        opt.lastDate = this.state.containerData[optionId].lastDate
        opt.processOptionId = optionId

        this.setOptionsState({ [opt.key]: { isInProgressSaving: true } })

        this.saveContainerData(opt)
    }

    onContainerLastDateChange(optionClassId, key, optionId, date, dateString) {
        const opt = this.getOptionDetails(optionClassId, key)
        opt.processOptionId = optionId

        if (date) {
            this.setOptionsState({ [opt.key]: { isLastDateSaving: true } })

            opt.lastDate = dateString
            opt.isLastProcessInProgress =
                this.state.containerData[optionId].isLastProcessInProgress === null ?
                    false : this.state.containerData[optionId].isLastProcessInProgress

            this.saveContainerData(opt)
        }
    }

    saveContainerData(params) {
        const { lastDate, isLastProcessInProgress, ...option } = params

        return this.props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${option.siteId}/asset-types/${option.assetTypeId}/compliances/${option.complianceId}/options/${option.optionId}`)
            .send({
                LastDate: lastDate,
                IsLastProcessInProgress: isLastProcessInProgress
            })
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        this.setState(prevState => ({
                            containerData: {
                                ...prevState.containerData,
                                [option.processOptionId]: {
                                    ...prevState.containerData[option.processOptionId],
                                    lastDate: lastDate,
                                    isLastProcessInProgress: isLastProcessInProgress,
                                    status: response.body.Status,
                                    statusId: response.body.StatusId,
                                    colorId: response.body.ColorId
                                }
                            }
                        }))
                    }

                    this.setOptionsState({ [option.key]: { isLastDateSaving: false, isInProgressSaving: false } })
                },
                _ => this.setOptionsState({ [option.key]: { isLastDateSaving: false, isInProgressSaving: false } }))
            .catch(err => this.setOptionsState({ [option.key]: { isLastDateSaving: false, isInProgressSaving: false } }))
    }

    getStatusContent(customerComplianceOptionId) {
        return customerComplianceOptionId ? <StatusInfoPopoverContent
            customerComplianceOptionId={customerComplianceOptionId}
            customerComplianceOptionAssetId={null}
            config={this.props.config}></StatusInfoPopoverContent> : <></>
    }

    onOptionInfoClick(e) {
        if (e) {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
        }
    }

    onPanelHeaderClick(event) {
        event.stopPropagation();
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

    getOptionPanelHeader(option, containerData, isChecked, isContainer, isSavingOption, isOptionDisabled, isEditVendorEnabled, showContainerControls) {
        return <div className="customer-compliance-collapse__item customer-compliance-collapse__item-option" onClick={evt => this.onPanelHeaderClick(evt)}>
            <Row className="option-info">
                <Col span={9}>
                    <div className="">
                        {(!isSavingOption && <CheckboxWrapper name={option.checkboxName} disabled={isOptionDisabled}
                            isChecked={this.state.checkedItems.get(option.optionId)}
                            onChange={option.onChange} label={option.option}
                            subtitle={(option.isChecked ? !isContainer ?
                                "individual job" : "one job for all " : "")}
                            description={(option.selectedOption && option.selectedOption.description) ? option.selectedOption.description : null}
                            hasPopover={true}>
                        </CheckboxWrapper>) || <Spin className="loading-status" size="small"></Spin>}
                    </div>
                </Col>
                {isContainer && <>
                    <Col span={4} offset={1} className="last-date two-lines">
                        {showContainerControls && <>
                            {(option.selectedOption.projectStartModeId === ProjectStartMode.Schedule &&
                                <>
                                    <Select
                                        showSearch
                                        style={{ width: 200 }}
                                        placeholder="Select a schedule"
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {this.props.scheduleGroup[option.scheduleGroupId] &&
                                            this.props.scheduleGroup[option.scheduleGroupId].map(s => <Option value={s.id}>{s.name}</Option>)}
                                    </Select>
                                    <span className="two-lines__label">
                                        Schedule Group
                                    </span>
                                </>) || <>
                                    <Spin size="small" spinning={(this.state.optionsState[option.key] && this.state.optionsState[option.key].isLastDateSaving) === true} >
                                        <DatePicker allowClear={false} value={(containerData.lastDate && moment(containerData.lastDate)) || undefined}
                                            onChange={option.selectedOption.onContainerLastDateChange} format={DateFormat} />
                                    </Spin>
                                    <span className="two-lines__label">
                                        {(option.selectedOption.projectStartModeId === ProjectStartMode.RefDate && option.selectedOption.lastDateHeaderName)
                                            ? <>
                                                <Popover overlayClassName={`info-popover ${(option.selectedOption.lastDateDetails ? '' : 'no-content')}`} placement="top"
                                                    title={this.getCustomHeaderPopoverTitle(option.selectedOption.lastDateHeaderName)}
                                                    content={this.getCustomHeaderPopoverContent(option.selectedOption.lastDateDetails)} trigger="click">
                                                    <InfoIconSmall className={`icon-svg description-popover`} />
                                                    <span className="text">{option.selectedOption.lastDateHeaderName}</span>
                                                </Popover>
                                            </> : <span className="text">Last Date</span>}
                                    </span>
                                </>}
                        </>}
                    </Col>
                    <Col span={4} offset={1} className="last-process two-lines">
                        {showContainerControls && <>
                            <Switch disabled={!containerData.lastDate} onChange={option.selectedOption.onContainerInProgressChange}
                                checkedChildren="Yes" unCheckedChildren="No"
                                loading={(this.state.optionsState[option.key] && this.state.optionsState[option.key].isInProgressSaving) === true}
                                checked={containerData.isLastProcessInProgress} />
                            <span className="two-lines__label">
                                {(option.selectedOption.projectStartModeId === ProjectStartMode.RefDate && option.selectedOption.stillInProgressHeaderName)
                                    ? <>
                                        <Popover overlayClassName={`info-popover ${(option.selectedOption.stillInProgressDetails ? '' : 'no-content')}`} placement="top"
                                            title={this.getCustomHeaderPopoverTitle(option.selectedOption.stillInProgressHeaderName)}
                                            content={this.getCustomHeaderPopoverContent(option.selectedOption.stillInProgressDetails)} trigger="click">
                                            <InfoIconSmall className={`icon-svg description-popover`} />
                                        </Popover>
                                        <span className="text">{option.selectedOption.stillInProgressHeaderName}</span>
                                    </> : <span className="text">Still in Progress</span>}
                            </span>
                        </>}
                    </Col>
                    <Col span={5} className="option-status">
                        {(containerData.statusId === Status.Ready &&
                            <button type="button" className="btn btn-success confirm-btn"
                                onClick={option.selectedOption.onSetupDone} disabled={(this.state.optionsState[option.key] && this.state.optionsState[option.key].isSetupSaving) === true}>
                                Confirm{(this.state.optionsState[option.key] && this.state.optionsState[option.key].isSetupSaving) === true ? "..." : ""}
                            </button>) ||
                            <>
                                {containerData.statusId < Status.Ready &&
                                    <Text className={(containerData.colorId === StatusInfoColor.Green ? "active" : "")}>
                                        {containerData.status}
                                    </Text>}
                                {containerData.statusId > Status.Ready &&
                                    <Popover trigger="click" content={this.getStatusContent(containerData.customerComplianceOptionId)} placement="leftTop" overlayClassName="status-popover"
                                        destroyTooltipOnHide={true} arrowPointAtCenter autoAdjustOverflow>
                                        <Button style={{ padding: 0 }} onClick={option.selectedOption.onGetStatusInfo} type="link" ghost >
                                            {(containerData.colorId === StatusInfoColor.Green ? <JobActiveIcon /> : <JobPendingIcon />)}
                                        </Button>
                                    </Popover>}
                            </>
                        }
                    </Col>
                </>}
            </Row>
        </div>
    }

    render() {

        return <div className="compliance-option">
            {this.props.options.length > 0
                ? this.props.options.map(o => {
                    const isContainer = o.selectedOption && o.selectedOption.isContainer
                    const isChecked = this.state.checkedItems.get(o.optionId)
                    const containerData = this.state.containerData && this.state.containerData[o.optionId]
                    const isSavingOption = this.state.optionsState && this.state.optionsState[o.key] && this.state.optionsState[o.key].isSavingOption
                    let isEditVendorEnabled = true
                    let isOptionDisabled = !this.props.isCheckedAssetType || !this.props.isCheckedCompliance

                    if (this.props.assets && this.props.assets[o.key]) {
                        if (this.props.assets[o.key].containerStatus && this.props.assets[o.key].containerStatus.optionStatusId) {
                            containerData.statusId = this.props.assets[o.key].containerStatus.optionStatusId
                            containerData.status = this.props.assets[o.key].containerStatus.optionStatus
                        }
                        if (this.props.assets[o.key].assets && !isOptionDisabled) {
                            isEditVendorEnabled = !this.props.assets[o.key].assets.some(a => a.statusId > Status.Ready)
                            isOptionDisabled = this.props.assets[o.key].assets.some(a => a.isChecked)
                        }
                    }

                    if (isContainer && containerData.statusId > Status.Ready) {
                        isEditVendorEnabled = false
                        isOptionDisabled = true
                    }

                    let showContainerControls = false

                    if (isContainer) {
                        if (containerData.statusId <= Status.Ready) {
                            showContainerControls = true
                        }
                    }

                    return <div key={o.key} className="option">
                        <Collapse className={`customer-compliance-collapse ${(!this.state.checkedItems.get(o.optionId) ? 'no-expand' : '')}`} expandIconPosition={"right"} key={`collapsable-complianceoption__${o.key}`}>
                            <Panel key={`panel-complianceoption__${o.key}`}
                                forceRender={true}
                                header={this.getOptionPanelHeader(o, containerData, isChecked, isContainer, isSavingOption, isOptionDisabled, isEditVendorEnabled, showContainerControls)}>
                                {
                                    o.selectedOption &&
                                    <AssetsContainer {...this.state.configAssets} optionKey={o.key} isContainer={o.selectedOption.isContainer}
                                        optionId={o.selectedOption.classOptionId} containerData={containerData} optionDetails={o.selectedOption}
                                        config={this.props.config}></AssetsContainer>
                                }
                            </Panel>
                        </Collapse>
                    </div>
                })
                : "No options available"
            }
            {
                this.state.configOptions.showConfigModal
                && <ConfigSelectionOption {...this.state.configOptions} config={this.props.config}></ConfigSelectionOption>
            }
        </div >
    }
}

export default connect(
    getState,
    getActions,
)(OptionsContainer)