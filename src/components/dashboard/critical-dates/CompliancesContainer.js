import React, { Component } from "react"
import { connect } from "react-redux"

import * as api from "../../../constants/api"

import CheckboxWrapper from "./Checkbox"
import OptionsContainer from "./OptionsContainer"
import { Spin, Collapse } from "antd"
import { CRITICAL_DATES_UPDATE_ASSET_TYPE_STATUS } from "../../../constants/ActionTypes"
import { fetchSchedules } from "../../../actions/criticalDates"

const { Panel } = Collapse;

const getState = state => {
    return {
        criticalDates: state.criticalDates,
    }
}

const getActions = dispatch => {
    return {
        fetchSchedules: scheduleGroupIds => dispatch(fetchSchedules(scheduleGroupIds)),
        updateAssetTypeStatus: (assetTypeId, complianceId, isChecked) => dispatch({ type: CRITICAL_DATES_UPDATE_ASSET_TYPE_STATUS, payload: { assetTypeId, complianceId, isChecked } })
    }
}

export class CompliancesContainer extends Component {
    constructor(props) {
        super(props)

        const checkedItems = new Map()
        let compliancesState = {}

        this.onChildOptionChange = this.onChildOptionChange.bind(this)

        if (this.props.compliances) {
            this.props.compliances.forEach(c => {
                c.checkboxName = `compliance-${c.complianceClassId}`
                c.onChange = this.onComplianceChange.bind(this, c.complianceClassId)

                let scheduleGroupIds = new Set()
                if (c.options) {
                    c.options.forEach(co => {
                        if (co.selections) {
                            co.selections.forEach(s => {
                                if (s.scheduleGroupId) {
                                    scheduleGroupIds.add(s.scheduleGroupId)
                                }
                            })
                        }
                    })
                }
                c.onCollapseChange = this.onCollapseChange.bind(this, [...scheduleGroupIds])

                c.key = `${this.props.assetTypeId}${c.complianceClassId}`
                compliancesState[c.key] = {}

                checkedItems.set(c.complianceClassId, c.isChecked)
            })
        }

        this.state = {
            checkedItems: checkedItems,
            compliancesState: compliancesState,
        }
    }

    onComplianceChange(complianceId, event) {
        const compliance = this.props.compliances.find(x => x.complianceClassId === complianceId)

        if (compliance) {
            const { key } = compliance
            if (this.props.isCheckedAssetType) {
                this.saveCompliance(this.props.siteId, this.props.assetTypeId, complianceId, key, event.target.checked)
                    .then(
                        response => {
                            if (!response.ok) {
                                throw Error(response.statusText)
                            }

                            if (response.body.IsSuccess) {
                                this.updateCheckedItems(complianceId, event.target.checked, key)
                            }
                        },
                        () => this.updateCheckedItems(complianceId, !event.target.checked, key)
                    )
                    .catch(err => this.updateCheckedItems(complianceId, !event.target.checked, key))
            }
        }
    }

    updateCheckedItems(id, isChecked, key) {
        this.setState(prevState => ({
            checkedItems: prevState.checkedItems.set(id, isChecked),
            compliancesState: {
                ...prevState.compliancesState,
                [key]: { isLoading: false }
            }
        }))

        this.props.updateAssetTypeStatus(this.props.assetTypeId, id, isChecked)
    }

    saveCompliance = (siteId, assetTypeId, complianceClassId, key, checked) => {
        this.setState(prevState => ({
            compliancesState: {
                ...prevState.compliancesState,
                [key]: { ...prevState.compliancesState[key], isLoading: true }
            }
        }))

        return this.props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${siteId}/asset-types/${assetTypeId}/compliances/${complianceClassId}?isChecked=${checked}`)
    }

    onChildOptionChange = (isAnyChecked, key) => {
        this.setState(prevState => ({
            compliancesState: {
                ...prevState.compliancesState,
                [key]: { isAnyChildOptionChecked: isAnyChecked }
            }
        }))
    }

    onPanelHeaderClick(event) {
        event.stopPropagation();
    }

    getClassPanelHeader(complianceClass, isLoading, isChecked, isAnyChildOptionChecked) {
        return <div className="customer-compliance-collapse__item customer-compliance-collapse__item-class" onClick={evt => this.onPanelHeaderClick(evt)}>
            {!isLoading ?
                <CheckboxWrapper name={complianceClass.checkboxName}
                    isChecked={isChecked} label={complianceClass.complianceClass}
                    onChange={complianceClass.onChange} disabled={isAnyChildOptionChecked}>
                </CheckboxWrapper> :
                <Spin className="loading-status" size="small"></Spin>
            }
        </div>
    }

    onCollapseChange(scheduleGroupIds) {
        this.props.fetchSchedules(scheduleGroupIds)
    }

    render() {
        return <div className="compliance">
            {this.props.compliances.length > 0 ? this.props.compliances.map(c => {
                const key = `${this.props.assetTypeId}${c.complianceClassId}`
                const isChecked = this.state.checkedItems.get(c.complianceClassId)
                const isLoading = this.state.compliancesState[key].isLoading
                const isAnyChildOptionChecked = this.state.compliancesState[key].isAnyChildOptionChecked


                return <Collapse className={`customer-compliance-collapse ${(!this.state.checkedItems.get(c.complianceClassId) ? 'no-expand' : '')}`}
                    expandIconPosition={"right"} key={`collapsable-complianceclass__${key}`} onChange={c.onCollapseChange}>
                    <Panel key={`panel-complianceclass__${key}`}
                        forceRender={true}
                        header={this.getClassPanelHeader(c, isLoading, isChecked, isAnyChildOptionChecked)}>
                        <div className="checkbox" key={c.complianceClassId}>
                            {c.options && <OptionsContainer options={c.options} siteId={this.props.siteId} isCheckedCompliance={isChecked}
                                isCheckedAssetType={this.props.isCheckedAssetType} assetTypeId={this.props.assetTypeId} updateParentContainer={this.onChildOptionChange}
                                complianceId={c.complianceClassId} assetTypeName={this.props.assetTypeName} config={this.props.config}>
                            </OptionsContainer>}
                        </div>
                    </Panel>
                </Collapse>
            }) : "No options available"}

        </div>
    }
}
export default connect(
    getState,
    getActions,
)(CompliancesContainer)