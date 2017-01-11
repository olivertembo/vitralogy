import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table"
import SweetAlert from "react-bootstrap-sweetalert"
import Input from "antd/lib/input"
import Button from "antd/lib/button"
import Tooltip from "antd/lib/tooltip"
import Switch from "antd/lib/switch"

import EmptyStateContainer from "../../containers/EmptyStateContainer"
const questionIcon = require("../../assets/images/question.png")
const InputGroup = Input.Group
const Search = Input.Search

const propTypes = {
  showAdd: PropTypes.bool.isRequired,
  selectedSites: PropTypes.array.isRequired,
  customerSites: PropTypes.array.isRequired,
  onSubmitItem: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onFilterSiteAssignmentsChange: PropTypes.func.isRequired,
  onSaveSearchTerm: PropTypes.func.isRequired,
  searchKeyword: PropTypes.string,
}

const defaultProps = {
  selectedSites: [],
  customerSites: [],
}

const getState = state => {
  return {
    isPosting: state.team.isPosting,
  }
}

class SiteAssignments extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      alert: null,
      sites: props.customerSites,
      showAll: true,
    }

    this.hideAlert = this.hideAlert.bind(this)
    this.siteFormatter = this.siteFormatter.bind(this)
    this.showRemoveConfirm = this.showRemoveConfirm.bind(this)
    this.showAddConfirm = this.showAddConfirm.bind(this)
    this.onSaveSearchTerm = this.onSaveSearchTerm.bind(this)
    this.onFilterSiteAssignments = this.onFilterSiteAssignments.bind(this)
    this.onShowAllChange = this.onShowAllChange.bind(this)
    this.moveCaretAtEnd = this.moveCaretAtEnd.bind(this)
  }

  get displayName() {
    return "SiteAssignments"
  }

  componentDidMount = () => {}

  componentWillReceiveProps = nextProps => {
    this.setState({ sites: nextProps.customerSites })
  }

  moveCaretAtEnd(e) {
    var temp_value = e.target.value
    e.target.value = ""
    e.target.value = temp_value
  }

  hideAlert() {
    this.setState({ alert: null })
  }

  onShowAllChange(checked) {
    console.log(`show all switch to ${checked}`)

    if (!checked) {
      let selectedSites = []
      for (const site of this.props.customerSites) {
        for (const selected of this.props.selectedSites) {
          if (site.AccountSiteId === selected) {
            selectedSites.push(site)
          }
        }
      }

      this.setState({
        showAll: checked,
        sites: selectedSites,
      })
    } else {
      this.setState({
        showAll: checked,
        sites: this.props.customerSites,
      })
    }
  }

  onRowSelect = (row, isSelected, e) => {
    if (isSelected) {
      this.showAddConfirm(row)
    } else {
      this.showRemoveConfirm(row)
    }
  }

  showRemoveConfirm(row) {
    let mesg = (
      <span>
        Are you sure you wish to remove {row.Name}, located at {row.Address}?
      </span>
    )
    this.setState({
      alert: (
        <SweetAlert
          title="Remove Site Assignment"
          custom
          showCancel
          customIcon={questionIcon}
          confirmBtnText="Yes, Remove!"
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="default"
          onConfirm={() => {
            this.props.onRemoveItem(row)
            this.hideAlert()
          }}
          onCancel={this.hideAlert}
        >
          {mesg}
        </SweetAlert>
      ),
    })
  }

  showAddConfirm(row) {
    let mesg = (
      <span>
        Are you sure you wish to add {row.Name}, located at {row.Address}?
      </span>
    )
    this.setState({
      alert: (
        <SweetAlert
          title="Add Site Assignment"
          custom
          showCancel
          customIcon={questionIcon}
          confirmBtnText="Yes, Add!"
          confirmBtnBsStyle="success"
          cancelBtnBsStyle="default"
          onConfirm={() => {
            this.props.onSubmitItem(row)
            this.hideAlert()
          }}
          onCancel={this.hideAlert}
        >
          {mesg}
        </SweetAlert>
      ),
    })
  }

  onSaveSearchTerm = e => {
    this.props.onSaveSearchTerm(e.target.value)
  }

  onFilterSiteAssignments = searchKeyword => {
    //this.props.onFilterSiteAssignmentsChange(searchKeyword)
    const term = searchKeyword.toLowerCase()
    console.log("searching:", term)

    const filteredSites = this.props.customerSites.filter(site => {
      return (
        site.Name.toLowerCase().indexOf(term) !== -1 ||
        site.Address.toLowerCase().indexOf(term) !== -1
      )
    })

    this.setState({
      sites: filteredSites,
    })
  }

  onClearFilterSiteAssignments = () => {
    //this.props.onFilterSiteAssignmentsChange(null)
    this.setState(
      {
        sites: this.props.customerSites,
      },
      () => this.props.onSaveSearchTerm(null),
    )
  }

  onSubmitSiteAssignments = selectedSites => {
    this.props.onSubmitItem(selectedSites)
  }

  siteFormatter = (cell, row) => {
    return (
      <span className="profile-list__row">
        {cell} ({row.Address})
      </span>
    )
  }

  render() {
    const className = "site-assignments"
    const unselectable = this.props.customerSites.map(item => {
      return item.AccountSiteId
    })
    const selectRowProp = {
      mode: "checkbox",
      clickToSelect: true,
      onSelect: this.onRowSelect,
      bgColor: "pink",
      selected: this.props.selectedSites,
      unselectable: this.props.disabled ? unselectable : [],
    }

    const msg = <div>No customer sites defined</div>
    let title = `No Sites!`

    return (
      <div className={className}>
        {this.state.alert}

        {this.props.customerSites.length === 0 && (
          <EmptyStateContainer alertStyle="info" title={title} message={msg} />
        )}

        {this.props.customerSites.length > 0 && (
          <div>
            <div className="row">
              <div className="col-md-8">
                <InputGroup compact>
                  <Tooltip
                    trigger={["hover"]}
                    title="Search by site name or site address, hit enter to begin search..."
                    placement="topLeft"
                    arrowPointAtCenter
                  >
                    <Search
                      autoFocus
                      onFocus={this.moveCaretAtEnd}
                      id="siteAssignmentFilter"
                      placeholder="Site Name or Address..."
                      onSearch={value => this.onFilterSiteAssignments(value)}
                      onChange={this.onSaveSearchTerm}
                      value={this.props.searchKeyword}
                      style={{ width: 250 }}
                    />
                  </Tooltip>
                  <Tooltip
                    trigger={["hover"]}
                    title="Click to clear search box"
                    placement="topLeft"
                    arrowPointAtCenter
                  >
                    <Button
                      type="primary"
                      icon="close"
                      onClick={this.onClearFilterSiteAssignments}
                    />
                  </Tooltip>
                </InputGroup>
              </div>

              <div className="col-sm-2">
                <Tooltip
                  trigger={["hover"]}
                  title={
                    this.state.showAll
                      ? "Click to show only selected sites"
                      : "Click to show all sites"
                  }
                  placement="topLeft"
                  arrowPointAtCenter
                >
                  <Switch
                    checkedChildren="All Sites"
                    unCheckedChildren="Selected Sites"
                    checked={this.state.showAll}
                    onChange={this.onShowAllChange}
                  />
                </Tooltip>
              </div>
            </div>

            <BootstrapTable
              data={this.state.sites}
              striped
              hover
              selectRow={selectRowProp}
              trClassName="break-word"
            >
              <TableHeaderColumn
                dataField="AccountSiteId"
                isKey={true}
                hidden
              />
              <TableHeaderColumn
                dataField="Name"
                dataFormat={this.siteFormatter}
              >
                Site (Location)
              </TableHeaderColumn>
              <TableHeaderColumn dataField="Address" hidden>
                Address
              </TableHeaderColumn>
            </BootstrapTable>
          </div>
        )}
      </div>
    )
  }
}

SiteAssignments.propTypes = propTypes
SiteAssignments.defaultProps = defaultProps

export default connect(getState)(SiteAssignments)
