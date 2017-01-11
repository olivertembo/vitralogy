import React from "react"
import PropTypes from "prop-types"

const propTypes = {
  items: PropTypes.array.isRequired,
  hideDescription: PropTypes.bool,
  uniqueInputPrefix: PropTypes.string,
}

const defaultProps = {
  items: [],
  hideDescription: true,
  uniqueInputPrefix: "",
}

export default function CheckList({
  items,
  hideDescription,
  uniqueInputPrefix,
}) {
  let helperClass = "meta"
  if (hideDescription === true) {
    helperClass = "helper-text-hidden"
  }

  const lastItemIndex = items.length - 1

  return (
    <div className="check-list">
      <form className="prereqs">
        {items.map((item, index) => {
          const inputId = `${uniqueInputPrefix}${item.CheckListId}`
          const spanClass =
            index === lastItemIndex ? "required-check-item" : null
          const name =
            index === lastItemIndex ? (
              <span className={spanClass}>{item.Name}</span>
            ) : (
              item.Name
            )

          return (
            <div className="checkbox" key={inputId}>
              {index === lastItemIndex && <hr />}
              <label htmlFor={inputId}>
                <input
                  id={inputId}
                  name={inputId}
                  type="checkbox"
                  disabled={true}
                  defaultChecked={item.IsSelected}
                />{" "}
                {item.IsRequired && <span className={spanClass}>* </span>}
                {item.UploadType} {name}
              </label>
              {index < lastItemIndex && <br />}
              <span className={helperClass}>{item.Description}</span>
            </div>
          )
        })}
      </form>
    </div>
  )
}

CheckList.propTypes = propTypes
CheckList.defaultProps = defaultProps
