import React from "react"
import PropTypes from "prop-types"
import Modal from "react-bootstrap/lib/Modal"
import Button from "react-bootstrap/lib/Button"

const propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func,
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.node),
  dialogClassName: PropTypes.string,
}

const defaultProps = {
  onHide: null,
  children: null,
  dialogClassName: null,
}

export default class ModalPopup extends React.Component {
  render() {
    return (
      <Modal
        backdrop="static"
        show={this.props.show}
        onHide={this.props.onHide}
        dialogClassName={this.props.dialogClassName}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.props.children}</Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={() => this.props.onHide()}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

ModalPopup.propTypes = propTypes
ModalPopup.defaultProps = defaultProps
