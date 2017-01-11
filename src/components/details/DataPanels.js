import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import Panel from "react-bootstrap/lib/Panel"
import PanelGroup from "react-bootstrap/lib/PanelGroup"
import Form from "react-bootstrap/lib/Form"
import FormGroup from "react-bootstrap/lib/FormGroup"
import Select from "react-select"

import DocumentTable from "./DocumentTable"
import CustomerSiteItem from "./CustomerSiteItem"
import SiteInfo from "./sites/SiteInfo"
import { selectSite, getSiteDetails } from "../../actions/sites"
import * as api from "../../constants/api"

// import "react-select/dist/react-select.css"

const propTypes = {
  data: PropTypes.object,
  auth: PropTypes.object,
}

const defaultProps = {
  data: {},
  auth: {},
  flags: {},
}

const getState = state => {
  return {
    _site: { ...state.sites },
  }
}

const getActions = dispatch => {
  return {
    selectSite: site => dispatch(selectSite(site)),
    getSiteDetails: siteId => dispatch(getSiteDetails(siteId)),
  }
}

const panels = {
  siteData: 1,
  accountDocuments: 2,
}

class DataPanels extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      defaultPanel: panels.siteData,
    }

    this.onSelectPanel = this.onSelectPanel.bind(this)
    this.onSelectSite = this.onSelectSite.bind(this)
    this.changeSite = this.changeSite.bind(this)
  }

  get displayName() {
    return "DataPanels"
  }

  componentDidMount() {
    let { defaultPanel } = this.state
    defaultPanel = panels.siteData

    // Set site selection here
    const activeSite = this.props.customerSites[0]

    if (activeSite !== undefined && activeSite !== null) {
      console.log("Active Site: " + JSON.stringify(activeSite))
      const site = {
        value: activeSite,
        label: activeSite.Name,
      }

      this.changeSite(site)
    }
    this.setState({ defaultPanel })
  }

  changeSite(site) {
    this.setState({
      selectSite: site.value,
    })

    this.props.selectSite(site)
    this.props.getSiteDetails(site.value.AccountSiteId)
  }

  onSelectSite(site) {
    this.changeSite(site)
  }

  onSelectPanel(activeKey) {
    this.setState({ defaultPanel: activeKey })
  }

  render() {
    if (this.props.data === null) {
      return <div>Loading ...</div>
    }

    const props = {
      auth: this.props.auth,
      scope: api.AccountScopeEnum.ACCOUNT,
      data: this.props.data,
    }

    let siteFilter = <div />

    const siteOptions = this.props.customerSites.map(item => {
      const label = item.Name
      return { value: item, label }
    })

    siteFilter = (
      <div>
        <section className="panel__header-section">
          <Row>
            <Col sm={4}>
              <Form>
                <FormGroup
                  controlId="formControlsSelect"
                  className="mr-md mb-no"
                >
                  <Select
                    name="select-site"
                    placeholder="Select site..."
                    clearable={false}
                    options={siteOptions}
                    onChange={this.onSelectSite}
                    value={this.props._site.selected}
                  />
                </FormGroup>
              </Form>
            </Col>
            <Col sm={8}>
              {this.props._site.selected && <SiteInfo {...this.props} />}
            </Col>
          </Row>
        </section>
      </div>
    )

    const siteData =
      this.props._site.selected === null
        ? null
        : this.props._site.selected.value

    return (
      <div className="job-detail__content-wrapper container-fluid">
        <PanelGroup
          id="main-panelGroup"
          activeKey={this.state.defaultPanel}
          onSelect={this.onSelectPanel}
          accordion
        >
          <Panel eventKey={panels.accountDocuments}>
            <Panel.Heading>
              <Panel.Title toggle>Account Documents</Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              <section className="panel__section">
                <DocumentTable {...props} />
              </section>
            </Panel.Body>
          </Panel>

          <Panel eventKey={panels.siteData}>
            <Panel.Heading>
              <Panel.Title toggle className="resource-panel">
                Sites
              </Panel.Title>
            </Panel.Heading>
            <Panel.Body collapsible>
              {siteFilter}

              <section className="panel__body">
                <CustomerSiteItem
                  {...props}
                  site={siteData}
                  data={this.props.data}
                />
              </section>
            </Panel.Body>
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
