import React, { Component } from "react";
import { connect } from "react-redux";
import Routes from "./routes";
import "./App.css";
import "./styles/index.scss";
import "./styles/styles/responsive.scss";
import { getTenantTheme } from "./actions/whiteLabelAction";
import { getSubDomainFromURL } from "./helpers";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gettingTheme: true,
    };
  }
  getTheme = () =>
    this.props
      .getTenantTheme()
      .then((response) => {
        this.setState({
          gettingTheme: false,
        });
      })
      .catch((error) => {
        this.setState({
          gettingTheme: false,
        });
      });
  componentDidMount() {
    window.CommunicationHandler = {};
    if (window.location.host.includes("localhost") || getSubDomainFromURL()) {
      this.getTheme();
    } else {
      // Don't execute theme-API if a subdomain is not present.
      this.setState({
        gettingTheme: false,
      });
    }
  }

  render() {
    const childProps = {};
    return this.state.gettingTheme ? null : (
      <div className="App">
        <Routes childProps={childProps} />
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  details: auth.data,
});

const mapDispatchToProps = (dispatch) => ({
  getTenantTheme: () => dispatch(getTenantTheme()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
