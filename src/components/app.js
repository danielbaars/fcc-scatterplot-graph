import React, { Component } from 'react';
import { json } from 'd3-request';

import ScatterplotGraph from './scatterplot_graph';

const DATA_URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    }
  }
  componentDidMount() {
    var _this = this;
    this.serverRequest = json(DATA_URL, d => {
      _this.setState({
        data: d
      });
    })
  }
   render() {
     return (
      <div className='App'>
        <div className="row">
          <div className="col-md-12">
            <h1>Doping in Professional Bicycle Racing</h1>
            <h2>35 Fastest times up Alpe d'Huez <span>(Normalized to 13.8km distance)</span></h2>
            { Object.keys(this.state.data).length !== 0 ? <ScatterplotGraph data={this.state.data} size={[690,500]} /> : null }
          </div>
        </div>
      </div>
     )
   }
};
