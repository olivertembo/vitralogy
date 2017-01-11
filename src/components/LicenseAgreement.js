import React from "react"
import PropTypes from "prop-types"
import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView"
import Button from "react-bootstrap/lib/Button"
import Icon from "react-fa/lib/Icon"
import { Scrollbars } from "react-custom-scrollbars"

const propTypes = {
  text: PropTypes.string,
  onAgreeClicked: PropTypes.func.isRequired,
  onScrollStop: PropTypes.func.isRequired,
  disableAgree: PropTypes.bool,
  isPosting: PropTypes.bool.isRequired,
}

const defaultProps = {
  text: "",
  disableAgree: true,
}

export default class LicenseAgreement extends React.Component {
  render() {
    const {
      text,
      onAgreeClicked,
      disableAgree,
      onScrollStop,
      isPosting,
    } = this.props

    const scrollStyle = {
      width: "100%",
      height: 450,
    }

    return (
      <div className="col-sm-10 col-sm-offset-1">
        <div className="page-header">
          <h1>Terms of Use</h1>
        </div>
        <div className="license-agreement">
          <Scrollbars
            ref={input => {
              this.scrollbars = input
            }}
            style={scrollStyle}
            onScrollStop={() => {
              onScrollStop(this.scrollbars.getValues())
            }}
          >
            <FroalaEditorView
              className="agreement-body"
              model={text}
              readOnly
            />
          </Scrollbars>

          <Button
            bsStyle="primary"
            className="mt-lg pull-right btn-success"
            disabled={disableAgree}
            onClick={() => onAgreeClicked()}
          >
            {isPosting === true ? (
              <span>
                <Icon spin name="spinner" /> Submitting...
              </span>
            ) : (
              "I agree"
            )}
          </Button>
        </div>
      </div>
    )
  }
}

LicenseAgreement.propTypes = propTypes
LicenseAgreement.defaultProps = defaultProps
