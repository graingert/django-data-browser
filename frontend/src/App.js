import React from "react";
import "./App.css";
import { HomePage, QueryPage } from "./Components";
import { Query, getUrlForQuery } from "./Query";
let controller;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.initialState;
  }

  fetchResults(state) {
    const url = getUrlForQuery(this.props.config.baseUrl, state, "json");

    if (controller) controller.abort();
    controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState(result);
        },
        (error) => {
          this.setState({ error });
        }
      );
  }

  componentDidMount() {
    const reqState = {
      model: this.state.model,
      fields: this.state.fields,
      filters: this.state.filters,
      results: [],
    };
    window.history.replaceState(
      reqState,
      null,
      getUrlForQuery(this.props.config.baseUrl, this.state, "html")
    );
    this.fetchResults(this.state);
    window.onpopstate = (e) => {
      this.fetchResults(e.state);
      this.setState(e.state);
    };
  }

  handleQueryChange(queryChange) {
    const newState = { ...this.state, ...queryChange };
    this.setState(queryChange);
    const reqState = {
      model: newState.model,
      fields: newState.fields,
      filters: newState.filters,
      results: [],
    };
    window.history.pushState(
      reqState,
      null,
      getUrlForQuery(this.props.config.baseUrl, newState, "html")
    );
    this.fetchResults(newState);
  }

  render() {
    const query = new Query(
      this.props.config,
      this.state,
      this.handleQueryChange.bind(this)
    );
    if (this.state.model)
      return (
        <QueryPage
          query={query}
          sortedModels={this.props.config.sortedModels}
          version={this.props.config.version}
          {...this.state}
        />
      );
    else
      return (
        <HomePage
          query={query}
          sortedModels={this.props.config.sortedModels}
          savedViews={this.props.config.savedViews}
          version={this.props.config.version}
        />
      );
  }
}

export default App;
