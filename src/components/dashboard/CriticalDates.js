import React, { Component } from "react"
import { Modal, Button } from "react-bootstrap"

import * as api from "../../constants/api"
import { connect } from "react-redux"
import { fetchData, resetCriticalDates, fetchCompliances } from "../../actions/criticalDates"
import EditResources from "./critical-dates/EditResources"
import AssetTypesContainer from "./critical-dates/AssetTypesContainer"

const getState = state => {
    return {
        criticalDates: state.criticalDates,
    }
}

const getActions = dispatch => {
    return {
        fetchData: siteId => dispatch(fetchData(siteId)),
        resetCriticalDates: () => dispatch(resetCriticalDates()),
        fetchCompliances: (assetTypeId, siteId) => dispatch(fetchCompliances(assetTypeId, siteId))
    }
}

class CriticalDates extends Component {
    constructor(props) {
        super(props)

        this.onAssetTypeChange = this.onAssetTypeChange.bind(this)
        this.onEditResources = this.onEditResources.bind(this)
        this.onAssetSaved = this.onAssetSaved.bind(this)

        this.state = {
            showFullScreenDrawer: false,
            selectedWidget: null,
            showCriticalDatesModal: false,
            currentAssetType: { id: null, name: null, assets: [] },
            showEditResourcesModal: false,
            currentSelectionOptions: [],
            showChooseSelectionOption: false,
            checkedAssetTypes: new Map(),
            assetTypesState: {}
        }
    }

    componentDidMount() {
        this.props.fetchData(this.props.config.activeNode.activeSite.value)
    }

    componentWillUnmount() {
        this.props.resetCriticalDates()
    }

    saveAssetType = (assetTypeId, isChecked, checkedItems) => {
        this.setState(prevState => ({
            assetTypesState: {
                ...prevState.assetTypesState,
                [assetTypeId]: { isLoading: true }
            }
        }))

        return this.props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${this.props.config.activeNode.activeSite.value}/asset-types/${assetTypeId}?isChecked=${isChecked}`)
            .then(
                response => {
                    if (!response.ok) {
                        throw Error(response.statusText)
                    }

                    if (response.body.IsSuccess) {
                        this.updateAssetTypesCheckedItems(assetTypeId, isChecked, checkedItems)

                        const updatedAssetType = this.props.criticalDates.assetTypes.find(x => x.assetTypeId === assetTypeId)
                        if (isChecked && updatedAssetType && updatedAssetType.compliances.length === 0) {
                            this.props.fetchCompliances(assetTypeId, this.props.config.activeNode.activeSite.value)
                        }
                    }
                },
                _ => this.updateAssetTypesCheckedItems(assetTypeId, !isChecked, checkedItems)
            )
    }

    updateAssetTypeState(id, isChecked) {
        this.setState(prevState => ({
            assetTypes: prevState.assetTypes.map(x =>
                x.assetTypeId === id ? { ...x, isChecked: isChecked } : x)
        }))
    }

    updateComplianceState(compliance, isChecked) {
        this.setState(prevState => ({
            assetTypes: prevState.assetTypes.map(x =>
                x.assetTypeId === compliance.assetTypeId ?
                    {
                        ...x, compliances: x.compliances.map(c =>
                            c.complianceClassId === compliance.complianceClassId ? { ...c, isChecked: isChecked } : c)
                    }

                    : x)
        }))
    }

    getAssetTypeById(id) {
        return this.props.criticalDates.assetTypes.find(x => x.assetTypeId === id)
    }

    onAssetTypeChange(assetTypeId, isChecked, checkedItems) {
        const assetType = this.getAssetTypeById(assetTypeId)

        if (isChecked) {
            const assetTypeDetails = this.props.config.activeNode.activeSite.assetTypesDetails.find(x => x.id === assetTypeId)

            if (assetTypeDetails && assetTypeDetails.assets.length > 0) {
                this.saveAssetType(assetTypeId, isChecked, checkedItems)
            }
            else {
                this.setState({
                    showCriticalDatesModal: true,
                    currentAssetType: {
                        id: assetTypeId,
                        name: assetType.assetTypeName,
                        assets: []
                    }
                })
            }
        }
        else {
            this.saveAssetType(assetTypeId, isChecked, checkedItems)
        }
    }


    updateAssetTypesCheckedItems(id, isChecked, checkedItems) {
        checkedItems.set(id, isChecked)

        this.setState(prevState => ({
            checkedAssetTypes: checkedItems,
            assetTypesState: {
                ...prevState.assetTypesState,
                [id]: { isLoading: false }
            }
        }))
    }

    onModalConfirmed = () => {
        this.setState({
            showCriticalDatesModal: false,
            showEditResourcesModal: true
        })
    }

    onAssetSaved = (assets, assetTypeId) => {
        const assetTypeDetails = this.props.config.activeNode.activeSite.assetTypesDetails.find(x => x.id === assetTypeId)

        if (assetTypeDetails) {
            assetTypeDetails.assets = assets
        } else {
            this.props.config.activeNode.activeSite.assetTypesDetails.push({ id: assetTypeId, assets: assets })
        }
    }

    onEditResources(assetTypeId) {
        const assetType = this.props.criticalDates.assetTypes.find(x => x.assetTypeId === assetTypeId)

        if (assetType) {
            const assetTypeDetails = this.props.config.activeNode.activeSite.assetTypesDetails.find(x => x.id === assetType.assetTypeId)

            this.setState({
                showEditResourcesModal: true,
                currentAssetType: {
                    id: assetType.assetTypeId,
                    name: assetType.assetTypeName,
                    assets: (assetTypeDetails && assetTypeDetails.assets) || []
                }
            })
        }
    }

    onSelectionOption = (opt) => {
        this.setState({
            showChooseSelectionOption: false
        })
    }

    onCancelEditResources = () => {
        this.setState({
            showEditResourcesModal: false
        })
    }

    render() {
        const { assetTypes } = this.props.criticalDates
        const { assetTypesState } = this.state

        let editResources = {
            site: {
                id: this.props.config.activeNode.activeSite.value,
                name: this.props.config.activeNode.activeSite.label,
            },
            assetType: this.state.currentAssetType,
            showEditResourcesModal: this.state.showEditResourcesModal,
            onSaved: this.onAssetSaved,
            cancel: this.onCancelEditResources,
            auth: this.props.config.auth
        }

        return <div>
            {assetTypes &&
                <AssetTypesContainer config={this.props.config} assetTypes={assetTypes} onChangeAssetType={this.onAssetTypeChange}
                    siteId={this.props.config.activeNode.activeSite.value} assetTypesState={assetTypesState}
                    checkedItems={this.state.checkedAssetTypes} onEditResources={this.onEditResources}>
                </AssetTypesContainer>}
            <div className="modal-critical">
                <Modal show={this.state.showCriticalDatesModal} backdrop="static">
                    <Modal.Body>
                        You need to setup at least one it of {this.state.currentAssetType.name} type in order to enable Critical Dates for this asset.
                      </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.onModalConfirmed}>OK</Button>
                    </Modal.Footer>
                </Modal>
                {this.state.showEditResourcesModal && <EditResources config={editResources}></EditResources>}
            </div>
        </div>
    }
}

export default connect(
    getState,
    getActions,
)(CriticalDates)