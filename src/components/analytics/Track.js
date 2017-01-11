import React from "react"
import ReactGA from "react-ga"

export class Track extends React.Component {
  onClick = (original, e) => {
    original && original(e)
    const { category, action, value, label, nonInteraction } = this.props
    ReactGA.event({ category, action, label, value, nonInteraction })
  }

  render() {
    return React.Children.map(this.props.children, c =>
      React.cloneElement(c, {
        onClick: this.onClick.bind(c, c.props.onClick),
      }),
    )
  }
}
