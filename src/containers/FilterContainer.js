import React from "react"
import PropTypes from "prop-types"
import Icon from "react-fa/lib/Icon"
import onClickOutside from "react-onclickoutside"

const propTypes = {
  children: PropTypes.node.isRequired,
  filtersApplied: PropTypes.string,
}

const defaultProps = {
  filtersApplied: null,
}

class FilterContainer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showDropdown: false,
    }

    this.onFilterClick = this.onFilterClick.bind(this)
  }

  onFilterClick() {
    const showDropdown = !this.state.showDropdown
    if (showDropdown === false) {
      this.filterButton.blur()
    }

    this.setState({ showDropdown })
  }

  handleClickOutside() {
    this.filterButton.blur()
    this.setState({ showDropdown: false })
  }

  render() {
    return (
      <div className="filter-container">
        <span className="meta">{this.props.filtersApplied}</span>
        <button
          ref={input => {
            this.filterButton = input
          }}
          className={`btn btn-default btn-filters btn-sm pull-right ${
            this.state.showDropdown ? "active" : null
          }`}
          onClick={() => this.onFilterClick()}
        >
          Filter <Icon name={this.state.showDropdown ? "times" : "filter"} />
        </button>
        {this.state.showDropdown && (
          <div className="filters">{this.props.children}</div>
        )}
      </div>
    )
  }
}

FilterContainer.propTypes = propTypes
FilterContainer.defaultProps = defaultProps

export default onClickOutside(FilterContainer)
