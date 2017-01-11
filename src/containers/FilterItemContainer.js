import React from "react"
import PropTypes from "prop-types"

const propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  colSize: PropTypes.string,
}

const defaultProps = {
  colSize: "col-sm-3",
}

export default class FilterItemContainer extends React.Component {
  render() {
    return (
      <div className={this.props.colSize}>
        <h4 className="list-title">{this.props.title}</h4>
        {this.props.children}
      </div>
    )
  }
}

FilterItemContainer.propTypes = propTypes
FilterItemContainer.defaultProps = defaultProps
