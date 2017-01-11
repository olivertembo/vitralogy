import React from "react"
import { connect } from "react-redux"
import { Row, Col } from "react-bootstrap"
import PropTypes from "prop-types"

import DocumentTable from "./DocumentTable"
import SiteRestrictionTable from "./sites/SiteRestrictionTable"
import * as api from "../../constants/api"

const propTypes = {
  site: PropTypes.object,
  auth: PropTypes.object,
}

const defaultProps = {
  site: {},
  auth: {},
}

const getState = state => {
  return {
    _site: { ...state.sites },
  }
}

class CustomerSiteItem extends React.Component {
  render() {
    const { site } = this.props

    if (site === null) {
      return <div />
    }

    return (
      <div>
        <div>
          <div className="section-header">
            <h4>Site Documents</h4>
          </div>
          <section className="panel__section">
            <Row>
              <Col sm={12}>
                <DocumentTable
                  {...this.props}
                  scope={api.AccountScopeEnum.SITE}
                />
              </Col>
            </Row>
          </section>
        </div>

        <div>
          <div className="section-header">
            <h4>Site Assignments</h4>
          </div>
          <section className="panel__section">
            <Row>
              <Col sm={12}>
                <SiteRestrictionTable {...this.props} />
              </Col>
            </Row>
          </section>
        </div>
        {/*
                <div>
                    <div className="section-header">
                        <h4>Issues</h4>
                    </div>
                    <section className="panel__section">
                        <Row>
                            <Col sm={12}>
                                <h1>TODO</h1>
                                    <CommentTable {...this.props}
                                        scope={api.SCOPE_VENDOR_JOBTIER}
                                    />
                            </Col>
                        </Row>
                    </section>
                </div>
*/}
      </div>
    )
  }
}

CustomerSiteItem.propTypes = propTypes
CustomerSiteItem.defaultProps = defaultProps

export default connect(getState)(CustomerSiteItem)
