import React, { useState } from "react"
import { Modal } from "react-bootstrap"
import * as api from "../../../constants/api"
import { Button, Radio } from "antd"

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
}

const OptionsGroup = ({ type = "radio", options, onChange, selectedValue, radioStyle, assetTypeName }) => {
    const [selectedOption, setSelectedOption] = useState(selectedValue)

    function onChangeOption(e) {
        setSelectedOption(e.target.value)
        onChange(e.target.value)
    }

    return <Radio.Group className="options-type" onChange={onChangeOption} value={selectedOption}>
        {options.map(o =>
            <Radio key={o.classOptionId} style={radioStyle} value={o.classOptionId}>
                {o.isContainer ? `one Job for all ${assetTypeName}` : `one Job for each of the ${assetTypeName}`}
            </Radio>)}
    </Radio.Group>
}

const ConfigSelectionOption = props => {
    const [modalState, setModalState] = useState({
        selectedOption: undefined,
        canSave: false,
        isSaving: false
    })

    function onConfirm() {
        setModalState({ ...modalState, isSaving: true })

        saveOption()
    }

    const onCancel = () => {
        props.onSetupOptionCancel()
    }

    function onOptionChange(id) {
        setModalState({ ...modalState, selectedOption: id })
    }

    function saveOption() {
        props.config.auth
            .request("post", `${api.CUSTOMER_API_ROOT}sites/${props.siteId}/asset-types/${props.assetTypeId}/compliances/${props.complianceId}/options/${modalState.selectedOption}?isChecked=true`)
            .then(response => {
                if (response && response.body.IsSuccess) {
                    props.onProcessOptionSaved(props.optionId, modalState.selectedOption, response.body)

                    props.onSetupOptionCancel()
                }
                else {
                    setModalState({ ...modalState, isSaving: false })
                }
            })
    }

    return <Modal show={props.showConfigModal} backdrop="static" enforceFocus={false} dialogClassName="config-selection-modal">
        <Modal.Body>
            <h4>How do you want to define the jobs:</h4>
            <div>
                <OptionsGroup radioStyle={radioStyle} onChange={onOptionChange} selectedValue={modalState.selectedOption}
                    options={props.options} assetTypeName={props.assetTypeName}></OptionsGroup>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button type="default" onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={onConfirm} disabled={!modalState.selectedOption} loading={modalState.isSaving}>OK</Button>
        </Modal.Footer>
    </Modal>
}
export default ConfigSelectionOption