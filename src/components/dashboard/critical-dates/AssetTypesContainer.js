import React, { Component } from "react"

import CheckboxWrapper from "./Checkbox"
import CompliancesContainer from "./CompliancesContainer"
import { Spin, Collapse, Button } from "antd"
import {ReactComponent as PencilIcon } from "../../../assets/icons/brand/pencil.svg"
const { Panel } = Collapse;

export default class AssetTypesContainer extends Component {
    constructor(props) {
        super(props)

        this.onComplianceChange = this.onComplianceChange.bind(this)
        this.onOptionChange = this.onOptionChange.bind(this)

        this.props.assetTypes.forEach(a => {
            a.checkboxName = `asset-type-${a.assetTypeId}`
            a.onEditResources = this.onEditResources.bind(this, a.assetTypeId)
            a.onChange = this.onAssetTypeChange.bind(this, a.assetTypeId)

            this.props.checkedItems.set(a.assetTypeId, a.isChecked)
        })
    }

    onEditResources(assetTypeId) {
        this.props.onEditResources(assetTypeId)
    }

    onAssetTypeChange(assetTypeId, event) {
        this.props.onChangeAssetType(assetTypeId, event.target.checked, this.props.checkedItems)
    }

    onOptionChange(optionId, complianceClassId, assetTypeId) {
        this.props.onOptionChange(optionId, complianceClassId, assetTypeId)
    }

    onComplianceChange(complianceClassId, assetTypeId) {
        this.props.onComplianceChange(complianceClassId, assetTypeId)
    }

    onPanelHeaderClick(event) {
        event.stopPropagation();
    }

    getAssetTypePanelHeader(assetType, isLoading, isChecked) {
        return <div className="customer-compliance-collapse__item" key={assetType.assetTypeId} onClick={evt => this.onPanelHeaderClick(evt)}>
            {(isLoading && <Spin className="loading-status" size="small"></Spin>) ||
                <CheckboxWrapper id={assetType.checkboxName} name={assetType.checkboxName}
                    isChecked={isChecked} label={assetType.assetTypeName}
                    onChange={assetType.onChange} disabled={assetType.isAnyChildChecked}>
                </CheckboxWrapper>
            }
            <Button className="asset-type__edit-btn" type="link" ghost onClick={assetType.onEditResources}>
                <PencilIcon/>
            </Button>
        </div>
    }

    render() {
        const { checkedItems, assetTypes, assetTypesState } = this.props
        return <>{
            assetTypes.map(assetType => {
                const isChecked = checkedItems.get(assetType.assetTypeId)
                let isLoading = false

                if (assetTypesState[assetType.assetTypeId]) {
                    isLoading = assetTypesState[assetType.assetTypeId].isLoading
                }
                
                return <Collapse className={`customer-compliance-collapse shadow ${(!checkedItems.get(assetType.assetTypeId)  ? 'no-expand' : '' )}`}
                    expandIconPosition={"right"} key={`collapsable-assettype__${assetType.assetTypeId}`}>
                    <Panel key={`panel-assettype__${assetType.assetTypeId}`} header={this.getAssetTypePanelHeader(assetType, isLoading, isChecked)}>
                        {(isChecked && (assetType.compliances && assetType.compliances.length > 0) ?
                            <CompliancesContainer config={this.props.config} compliances={assetType.compliances}
                                siteId={this.props.siteId} isCheckedAssetType={isChecked} assetTypeId={assetType.assetTypeId}
                                assetTypeName={assetType.assetTypeName}>
                            </CompliancesContainer> :
                            <div>No options available</div>)}
                    </Panel>
                </Collapse>
            })
        }
        </>
    }
}