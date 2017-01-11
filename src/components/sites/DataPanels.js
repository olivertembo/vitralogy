import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import {
  Row,
  Col,
  Panel,
  PanelGroup,
  Form,
  FormGroup,
  Breadcrumb,
} from "react-bootstrap"
import Select from "react-select"
import { Link } from "react-router-dom"
import Alert from "react-bootstrap/lib/Alert"
import Icon from "react-fa/lib/Icon"
import Button from "react-bootstrap/lib/Button"
import OverlayTrigger from "react-bootstrap/lib/OverlayTrigger"
import Tooltip from "react-bootstrap/lib/Tooltip"

import OverlayButton from "../layout/OverlayButton"
import DocumentTable from "../DocumentTable"
//import CustomerSiteItem from './CustomerSiteItem'
//import AccountTable from './AccountTable'
//import SiteInfo from './sites/SiteInfo'
import { getSiteDetails } from "../../actions/site"
import * as api from "../../constants/api"

// import "react-select/dist/react-select.css"

const propTypes = {
  data: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
}

const defaultProps = {
  data: {},
  auth: {},
}

const getState = state => {
  return {
    _site: {
      ...state.site,
    },
  }
}

const getActions = dispatch => {
  return {
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
  }
}

const panels = {
  accounts: 1,
  siteData: 2,
  siteDocuments: 3,
}

class DataPanels extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      defaultPanel: panels.siteData,
    }

    this.onSelectPanel = this.onSelectPanel.bind(this)
  }

  get displayName() {
    return "DataPanels"
  }

  componentDidMount() {
    let { defaultPanel } = this.state
    defaultPanel = panels.siteDocuments

    this.setState({ defaultPanel })
  }

  onSelectPanel(activeKey) {
    this.setState({ defaultPanel: activeKey })
  }

  render() {
    if (this.props.data.details === null) {
      return (
        <div className="job-detail">
          <div className="loading">
            <Icon spin size="5x" name="spinner" />
            &nbsp;Loading Site Details...
          </div>
        </div>
      )
    }

    const breadcrumb = (
      <Breadcrumb>
        <Breadcrumb.Item title="All Sites">
          <Link to={"/sites/"}>Sites</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item
          title={"Site " + this.props.data.details.Name + " details"}
          active
        >
          {this.props.data.details.Name}
        </Breadcrumb.Item>
      </Breadcrumb>
    )

    const props = {
      id: this.props.id,
      auth: this.props.auth,
      scope: api.AccountScopeEnum.SITE,
      data: this.props.data.details,
    }

    let siteFilter = <div />

    const siteAssignPanelTitle = "Assignments"

    return (
      <div className="job-detail__content-wrapper container-fluid">
        {breadcrumb}

        <PanelGroup
          id="main-panelGroup"
          activeKey={this.state.defaultPanel}
          onSelect={this.onSelectPanel}
          accordion
        >
          {/*
                    <Panel header={siteAssignPanelTitle} eventKey={panels.accounts}>
                        <section className="panel__section">
                            <h1>todo</h1>
                            <AccountTable {...props} />

                        </section>
                    </Panel>
                    */}

          <Panel header="Documents" eventKey={panels.siteDocuments}>
            <section className="panel__section">
              <DocumentTable {...props} />
            </section>
          </Panel>
        </PanelGroup>
      </div>
    )
  }
}

DataPanels.propTypes = propTypes
DataPanels.defaultProps = defaultProps

export default connect(
  getState,
  getActions,
)(DataPanels)
