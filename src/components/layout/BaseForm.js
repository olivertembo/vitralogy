import React from "react"
import PropTypes from "prop-types"
import Formsy from "formsy-react"

const propTypes = {
  children: PropTypes.node,
}

export default class MyForm extends React.Component {
  render() {
    return (
      <Formsy
        className={this.props.className}
        {...this.props}
        ref={input => {
          this.myform = input
        }}
      >
        {this.props.children}
      </Formsy>
    )
  }
}

MyForm.propTypes = propTypes
