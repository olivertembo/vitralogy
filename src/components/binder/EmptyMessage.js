import React from "react"
import Icon from "react-fa/lib/Icon"

const EmptyMessage = ({ ...props }) => {
  const { icon, title, children } = props
  return (
    <div className="virtual-binder loading">
      <div className="message">
        {icon ? <Icon size="5x" name={icon} /> : ""}
        {title ? <h1 className="mb-sm">{title}</h1> : ""}
        {children}
      </div>
    </div>
  )
}

export default EmptyMessage
