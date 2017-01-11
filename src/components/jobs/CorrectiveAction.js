import React from "react"
import PropTypes from "prop-types"
import { Modal } from "react-bootstrap"
import Formsy from "formsy-react"
import { Textarea, Input } from "formsy-react-components"
import { format } from "../../utils/datetime"

const propTypes = {
  show: PropTypes.bool.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
}

const defaultProps = {
  title: "Corrective Action Taken",
}

export default class CorrectiveAction extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "Corrective Action Taken",
    }

    this.handleCloseClick = this.handleCloseClick.bind(this)
  }

  handleCloseClick() {
    this.props.onCloseClick()
  }

  render() {
    return (
      <div className="corrective-action">
        <Modal
          backdrop="static"
          show={this.props.show}
          onHide={this.handleCloseClick}
        >
          <Modal.Header closeButton>
            <Modal.Title>{this.state.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Formsy
              ref={input => {
                this.myform = input
              }}
            >
              <Input
                name="correctedby"
                id="correctedby"
                label="Performed By"
                type="text"
                value={this.props.data.PerformedBy}
                readOnly
              />

              <Input
                name="correctedon"
                id="correctedon"
                label="Performed On"
                type="text"
                value={
                  format(this.props.data.PerformedOn, "l LT") +
                  " " +
                  this.props.data.SiteTimeZoneShortName
                }
                readOnly
              />

              <Textarea
                rows={5}
                cols={40}
                name="action"
                id="action"
                label="Action Taken"
                value={this.props.data.Comment}
                readOnly
              />
            </Formsy>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

CorrectiveAction.propTypes = propTypes
CorrectiveAction.defaultProps = defaultProps
