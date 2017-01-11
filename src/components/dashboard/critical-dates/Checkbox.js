import React from "react"
import { Checkbox, Popover } from "antd";
import { Scrollbars } from "react-custom-scrollbars"
import {ReactComponent as OptionIcon } from "../../../assets/icons/brand/option-icon.svg"
import {ReactComponent as OptionSelectedIcon } from "../../../assets/icons/brand/option-selected.svg"
import {ReactComponent as InfoIconSmall } from "../../../assets/icons/brand/info-icon-16x16.svg"
import {ReactComponent as InfoIconLarge } from "../../../assets/icons/brand/info-icon-24x24.svg"

function getPopoverContent(content){ 
    return content && 
        <Scrollbars autoHeight    
            autoHeightMax={250}>
            <span>{content}</span>
        </Scrollbars>; 
}

function getPopoverTitle(title){ 
    return <>
        <InfoIconLarge className="icon"/> {title}
    </>; 
}

const CheckboxWrapper = ({ type = 'checkbox', hasPopover = false, name, isChecked = false, onChange, disabled, label, subtitle, description }) => (
    
    <Checkbox
        name={name}
        onChange={onChange}
        checked={isChecked}
        disabled={disabled}
        className="compliance-checkbox"
    >      
      {(isChecked ? <OptionSelectedIcon className="icon-svg" onClick={evt => evt.preventDefault()}/> : <OptionIcon className="icon-svg" onClick={evt => evt.preventDefault()}/>)}
      { hasPopover && <Popover overlayClassName={`info-popover ${(description ? '' : 'no-content')}`} placement="top" title={getPopoverTitle(label)} content={getPopoverContent(description)} trigger="click">
        <InfoIconSmall className={`icon-svg description-popover ${isChecked ? '' : 'inactive'}`}/>
      </Popover>}
      <span onClick={evt => evt.preventDefault()}>
        <span>{label}</span>
        {subtitle && <span className="subtitle">{description}</span> }       
      </span>
    </Checkbox>
)

export default CheckboxWrapper