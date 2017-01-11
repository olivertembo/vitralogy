import React from "react"
import { camelizeKeys } from "humps"
import Button from "react-bootstrap/lib/Button"
import Select from "react-select"
import moment from "moment"

import ToastHelper from "../../utils/ToastHelper"
import * as api from "../../constants/api"

const binderPhoto = require("../../assets/images/virtual_binder.jpg")

export default class Cover extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      site: null,
      template: null,
      resource: null,
      year: null,
      siteLoading: false,
      resourceLoading: false,
      hideResourceSelection: false,
      yearLoading: false,
      siteData: [],
      resourceData: [],
      binderTemplateData: [],
      yearData: [],
    }
  }

  componentDidMount() {
    this.getSiteData()
  }

  getSiteData = () => {
    this.props.auth
      .request("get", api.CUSTOMER_SITES)
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)
          if (json.isSuccess) {
            let { site } = this.state
            const siteData = json.accountSites
            if (siteData.length === 1) {
              const singleSite = siteData[0]
              site = {
                label: singleSite.name,
                value: singleSite.accountSiteId,
              }
            }
            this.setState(
              {
                siteData,
                site,
                siteLoading: false,
              },
              () => {
                if (siteData.length === 1) {
                  this.getBinderTemplateData(site.value)
                }
              },
            )
          } else {
            ToastHelper.error("Error loading selected customer site ist!")
          }
        },
        () => {
          ToastHelper.error("Error loading selected customer site ist!")
        },
      )
      .then(() => {
        this.setState({
          siteLoading: false,
          hideResourceSelection: false,
        })
      })
  }

  onSelectSite = value => {
    this.setState({
      site: value,
      template: null,
      resource: null,
      year: null,
      hideResourceSelection: false,
    })

    if (value !== null) {
      this.getBinderTemplateData(value.value)
    }
  }

  getBinderTemplateData = accountSiteId => {
    this.setState({ binderTemplatesLoading: true })
    const url = `${api.VIRTUAL_BINDER_TEMPLATE}`
    this.props.auth
      .request("get", url)
      .query({ accountSiteId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)
          if (json.isSuccess) {
            let { template } = this.state
            let binderTemplateData = json.templates

            if (binderTemplateData.length === 1) {
              const singleTemplate = binderTemplateData[0]
              template = {
                label: singleTemplate.name,
                value: singleTemplate,
              }
              this.getResourceData(template)
            }
            this.setState({
              binderTemplateData,
              template,
            })
          } else {
            ToastHelper.error("Error loading site binder templates!")
          }
        },
        () => {
          ToastHelper.error("Error loading site binder templates!")
        },
      )
      .then(() => {
        this.setState({ binderTemplatesLoading: false })
      })
  }

  getResourceData = template => {
    if (template.value.isResourceBased) {
      this.setState({ resourceLoading: true })
      const url = `${api.VIRTUAL_BINDER_SITE_RESOURCES}`
      this.props.auth
        .request("get", url)
        .query({ binderTemplateId: template.value.vBinderTemplateId })
        .query({ siteId: this.state.site.value })
        .then(
          response => {
            if (!response.ok) {
              throw Error(response.statusText)
            }

            const json = camelizeKeys(response.body)
            if (json.isSuccess) {
              let { resource } = this.state
              const resourceData = json.resources
              if (resourceData.length <= 1) {
                if (resourceData.length === 1) {
                  const singleResource = resourceData[0]
                  resource = {
                    label: singleResource.name,
                    value: singleResource.accountSiteResourceId,
                  }
                } else {
                  resource = {
                    label: "N/A",
                    value: null,
                  }
                }
                this.getYearData(template, resource.value)
              }
              this.setState({
                resourceData,
                resource,
              })
            } else {
              ToastHelper.error("Error loading site resource list!")
            }
          },
          () => {
            ToastHelper.error("Error loading site resource list!")
          },
        )
        .then(() => {
          this.setState({ resourceLoading: false })
        })
    } else {
      let noResource = {
        label: "Non Resource Based",
        value: null,
      }
      this.getYearData(template, noResource.value)
      this.setState({
        resourceData: [],
        resource: noResource,
        hideResourceSelection: true,
      })
    }
  }

  onSelectTemplate = value => {
    this.setState({
      template: value,
      resource: null,
      year: null,
      hideResourceSelection: false,
    })

    if (value !== null) {
      this.getResourceData(value)
    }
  }

  onSelectResource = value => {
    this.setState({
      resource: value,
      year: null,
    })

    if (value !== null) {
      this.getYearData(this.state.template, value.value)
    }
  }

  getYearData = (template, accountSiteResourceId) => {
    const { site } = this.state
    this.setState({ yearLoading: true })
    const url = `${api.VIRTUAL_BINDER_YEARS}`
    this.props.auth
      .request("get", url)
      .query({ binderTemplateId: template.value.vBinderTemplateId })
      .query({ accountSiteId: site.value })
      .query({ accountSiteResourceId })
      .then(
        response => {
          if (!response.ok) {
            throw Error(response.statusText)
          }

          const json = camelizeKeys(response.body)
          if (json.isSuccess) {
            let { year } = this.state
            const yearData = json.years
            if (yearData.length === 1) {
              const singleYear = yearData[0]
              year = {
                label: singleYear,
                value: singleYear,
              }
            } else {
              // Set the default to  the current year if returned
              const todaysYear = moment().year()
              const currentYear = yearData.find(y => y === todaysYear)
              if (currentYear) {
                year = {
                  label: currentYear,
                  value: currentYear,
                }
              }
            }

            this.setState({
              yearData,
              year,
            })
          } else {
            ToastHelper.error("Error loading site template year list!")
          }
        },
        () => {
          ToastHelper.error("Error loading site template year list!")
        },
      )
      .then(() => {
        this.setState({ yearLoading: false })
      })
  }

  onSelectYear = value => {
    this.setState({ year: value })
  }

  loadBinder = () => {
    const { site, template, resource, year } = this.state

    const siteId = Number(site.value)
    const templateId = Number(template.value.vBinderTemplateId)
    const siteResourceId = Number(resource.value)
    const yearId = Number(year.value)

    this.props.history.push({
      pathname: `/binder/${siteId}/${templateId}/${siteResourceId}/${yearId}`,
      state: {
        selectedSiteName: site.label,
        selectedResourceName: siteResourceId > 0 ? resource.label : null,
        selectedYear: year.label,
        isSeasonal: this.getIsSeasonal(siteResourceId)
      }
    })
  }

  getIsSeasonal = (siteResourceId) => {
    let isSeasonal = false;

    if (this.state.resourceData) {
      let currentResource = this.state.resourceData.find(x => x.accountSiteResourceId === siteResourceId);

      if (currentResource) {
        isSeasonal = currentResource.isSeasonal;
      }
    }

    return isSeasonal;
  }

  render() {
    const {
      site,
      template,
      resource,
      year,
      siteLoading,
      resourceLoading,
      binderTemplatesLoading,
      yearLoading,
      siteData,
      resourceData,
      binderTemplateData,
      yearData,
      hideResourceSelection,
    } = this.state

    const siteOptions = siteData.map(item => {
      return { label: item.name, value: item.accountSiteId }
    })

    const binderTemplateOptions = binderTemplateData.map(item => {
      return { label: item.name, value: item }
    })

    const resourceOptions = resourceData.map(item => {
      return { label: item.name, value: item.accountSiteResourceId }
    })

    const yearOptions = yearData.map(item => {
      return { label: item, value: item }
    })

    return (
      <div className="virtual-binder loading">
        <figure className="binder-cover">
          <div className="overlay" />
          <img src={binderPhoto} alt="" />
        </figure>
        <div className="cover-form">
          <div className="col-md-4 col-md-offset-4">
            <div className="selector">
              <h1 className="text-center mt-no">Virtual Binder</h1>
              <div className="mb-sm">
                <Select
                  name="site"
                  options={siteOptions}
                  onChange={this.onSelectSite}
                  value={site}
                  placeholder={siteLoading ? "Loading..." : "Select site..."}
                  isLoading={siteLoading}
                  isDisabled={siteLoading || siteOptions.length === 1}
                />
              </div>
              <div className="mb-sm">
                <Select
                  name="template"
                  options={binderTemplateOptions}
                  onChange={this.onSelectTemplate}
                  value={template}
                  placeholder={
                    binderTemplatesLoading ? "Loading..." : "Select template..."
                  }
                  isDisabled={
                    site === null || binderTemplateOptions.length === 1
                  }
                  isLoading={binderTemplatesLoading}
                />
              </div>
              {!hideResourceSelection && (
                <div className="mb-sm">
                  <Select
                    name="resource"
                    options={resourceOptions}
                    onChange={this.onSelectResource}
                    value={resource}
                    placeholder={
                      resourceLoading ? "Loading..." : "Select resource..."
                    }
                    isDisabled={
                      template === null || resourceOptions.length <= 1
                    }
                    isLoading={resourceLoading}
                  />
                </div>
              )}
              <div className="mb-sm">
                <Select
                  name="year"
                  options={yearOptions}
                  onChange={this.onSelectYear}
                  value={year}
                  placeholder={yearLoading ? "Loading..." : "Select year..."}
                  isDisabled={resource === null || yearOptions.length === 1}
                  isLoading={yearLoading}
                />
              </div>
              <Button
                bsStyle="primary"
                className="btn-block"
                disabled={year === null}
                onClick={this.loadBinder}
              >
                Load Binder
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
