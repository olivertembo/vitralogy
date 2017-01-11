import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import * as api from "../../../constants/api"
import { Menu, Button, Form, Input, Switch, Spin } from 'antd'
import { Modal, Col } from "react-bootstrap"
import { ASSETS_UPDATE_ASSET } from "../../../constants/ActionTypes"

const { TextArea } = Input;

const emptyAssetDetails = {
    AssetId: 0, Name: "", Model: "",
    Maker: "", SerialNumber: "",
    Description: "", IsGroup: false
}

const mapAssetToContainer = asset => ({
    assetId: asset.AssetId, name: asset.Name,
})

const formItemLayout = {
    labelCol: {
        span: 6
    },
    wrapperCol: {
        span: 12
    },
}

const EditResourceForm = props => {
    useEffect(() => {
        if (props.isSaving) {
            onSubmit()
        }
    }, [props.isSaving])

    useEffect(() => {
        props.form.resetFields()
    }, [props.asset.AssetId])

    const onSubmit = event => {
        if (event) {
            event.preventDefault()
        }

        props.form.validateFields((err, data) => {
            if (!err) {
                saveAsset({ ...data, AssetId: (props.asset.AssetId && props.asset.AssetId) || null })
            }
            else {
                props.saveDone({ isSaveSuccess: false })
            }
        })
    }

    function saveAsset(asset) {
        props.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${props.siteId}/asset-types/${props.assetTypeId}/assets`)
            .send(asset)
            .then(
                response => {
                    if (response.body.IsSuccess) {
                        props.saveDone({ ...asset, AssetId: response.body.NewAssetId, isSaveSuccess: true })
                    }
                    else {
                        props.saveDone({ isSaveSuccess: false })
                    }
                },
                _ => props.saveDone({ isSaveSuccess: false }))
    }

    return <Form {...formItemLayout} onSubmit={onSubmit}>
        <Form.Item label="Name">
            {props.form.getFieldDecorator("Name", {
                initialValue: props.asset.Name,
                rules: [
                    { required: true, message: "Please specify asset name!" },
                    {
                        message: "Please specify a different name!",
                        validator: (rule, value, callback) => {
                            if (props.existingAssets.some(x => x.name.toLowerCase() === value.toLowerCase() && x.id !== props.asset.AssetId)) {
                                callback(new Error())
                            }
                            else {
                                callback()
                            }
                        }
                    }
                ],
            })(
                <Input placeholder="Name" />,
            )}
        </Form.Item>
        <Form.Item label="Maker">
            {props.form.getFieldDecorator("Maker", {
                initialValue: props.asset.Maker,
                rules: [],
            })(
                <Input placeholder="Maker" />,
            )}
        </Form.Item>
        <Form.Item label="Model">
            {props.form.getFieldDecorator("Model", {
                initialValue: props.asset.Model,
                rules: [],
            })(
                <Input placeholder="Model" />,
            )}
        </Form.Item>
        <Form.Item label="Serial">
            {props.form.getFieldDecorator("SerialNumber", {
                initialValue: props.asset.SerialNumber,
                rules: [],
            })(
                <Input placeholder="Serial" />,
            )}
        </Form.Item>
        <Form.Item label="Description">
            {props.form.getFieldDecorator("Description", {
                initialValue: props.asset.Description,
                rules: [],
            })(
                <TextArea rows={4} />,
            )}
        </Form.Item>
        <Form.Item className="asset-group-item" label={"Is this a system or a groupping of " + props.assetTypeName}>
            {props.form.getFieldDecorator("IsSystemOrGroup", {
                initialValue: props.asset.IsSystemOrGroup,
                valuePropName: "checked"
            })(
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
            )}
        </Form.Item>
    </Form>
}
const WrappedEditResourceForm = Form.create({ name: "edit_resource" })(EditResourceForm)

const EditResources = (props) => {
    const assets = useSelector(state => state.assets)
    const dispatch = useDispatch()
    const [currentAssetDetails, setCurrentAssetDetails] = useState(emptyAssetDetails)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedAssets, setSelectedAssets] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (currentAssetDetails.AssetId) {
            getAssetDetails(currentAssetDetails.AssetId)
        }
    }, [currentAssetDetails.AssetId])

    const edit = () => {
        setIsSaving(true)
        setIsLoading(true)
    }

    const onResourceClicked = (menuItem) => {
        setCurrentAssetDetails({ ...currentAssetDetails, AssetId: +menuItem.key })
        setSelectedAssets([menuItem.key])
    }

    function getAssetDetails(id) {
        setIsLoading(true)
        const url = api.ASSET_DETAILS_DASHBOARD_WIDGET(id)

        props.config.auth
            .request("get", url)
            .then(
                response => {
                    if (response.body.IsSuccess) {
                        let assetDetails = { AssetId: id }

                        response.body.AssetDetails.forEach(i => {
                            assetDetails[i.Name.replace(/\s+/g, '')] = i.Value
                        })

                        assetDetails.Maker = assetDetails.Make
                        assetDetails.IsSystemOrGroup = (assetDetails.IsSystemOrGroup === "1" && true) || false
                        setCurrentAssetDetails(assetDetails)
                        setIsLoading(false)
                    }
                },
                _ => setIsLoading(false))
    }

    const cancel = () => {
        setCurrentAssetDetails(emptyAssetDetails)
        props.config.cancel()
    }

    const addNew = () => {
        setCurrentAssetDetails(emptyAssetDetails)
        setSelectedAssets([])
    }

    const onSaveDone = (asset) => {
        setIsSaving(false)
        setIsLoading(false)

        if (asset.isSaveSuccess) {
            let assetItem = props.config.assetType.assets.find(a => a.id === asset.AssetId)

            if (!assetItem) {
                if (!props.config.assetType.assets) {
                    props.config.assetType.assets = []
                }

                props.config.assetType.assets.push({ id: asset.AssetId, name: asset.Name })
                setSelectedAssets([`${asset.AssetId}`])
            }
            else {
                assetItem.name = asset.Name
            }


            updateContainersAsset(asset)
            props.config.onSaved(props.config.assetType.assets, props.config.assetType.id)

            setCurrentAssetDetails({ ...currentAssetDetails, AssetId: asset.AssetId })
        }
    }

    const updateContainersAsset = asset => {
        if (assets) {
            for (let key in assets) {
                let assetsContainer = assets[key]

                if (assetsContainer.siteId === props.config.site.id && assetsContainer.assetTypeId === props.config.assetType.id) {
                    dispatch({ type: ASSETS_UPDATE_ASSET, payload: { key: key, asset: mapAssetToContainer(asset) } })
                }
            }
        }
    }

    const formConfig = {
        asset: currentAssetDetails, assetTypeName: props.config.assetType.name, auth: props.config.auth, existingAssets: props.config.assetType.assets,
        isSaving: isSaving, saveDone: onSaveDone, assetTypeId: props.config.assetType.id, siteId: props.config.site.id
    }

    return <Modal show={props.config.showEditResourcesModal} dialogClassName="edit-resources-modal" onHide={cancel}>
        <Modal.Header closeButton>
            <strong>{props.config.assetType.name}</strong> for {props.config.site.name}
        </Modal.Header>
        <Modal.Body>
            <div className="row edit-section">
                <Col sm={(props.config.assetType.assets && props.config.assetType.assets.length > 0 && 4) || 2} className="edit-section__menu">
                    <div className="asset-names">
                        <Menu onClick={onResourceClicked} style={{ width: "100%" }} mode="inline" selectedKeys={selectedAssets}>
                            {props.config.assetType.assets && props.config.assetType.assets.map(a => (
                                <Menu.Item key={a.id}>
                                    {a.name}
                                </Menu.Item>
                            ))}
                        </Menu>
                    </div>
                </Col>
                <Col sm={8} className="asset-details">
                    <Spin spinning={isLoading} size="large">
                        <strong>{(currentAssetDetails.AssetId > 0 && "Edit selected asset or") || "Add Asset"}</strong>
                        {currentAssetDetails.AssetId > 0 &&
                            <Button type="link" onClick={addNew}>Add New Asset</Button>}
                        <WrappedEditResourceForm {...formConfig}></WrappedEditResourceForm>
                    </Spin>
                </Col>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={cancel} style={{ marginRight: "7px" }}>Cancel</Button>
            <Button type="primary" onClick={edit} disabled={isSaving || isLoading}>Save</Button>
        </Modal.Footer>
    </Modal >
}
export default EditResources