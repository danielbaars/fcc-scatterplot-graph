import React, { Component } from 'react';
import { scaleLinear, scaleTime } from 'd3-scale';
import { min, max } from 'd3-array';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { transition } from 'd3-transition';
import { timeFormat } from 'd3-time-format';

export default class ScatterplotGraph extends Component {
  constructor(props){
    super(props)
    this.createScatterplotGraph = this.createScatterplotGraph.bind(this)
  }
  componentDidMount() {
    this.createScatterplotGraph()
  }
  componentDidUpdate() {
    this.createScatterplotGraph()
  }
  createScatterplotGraph() {

    let m = { top: 10, right: 15, bottom: 20, left: 22 };

    const w = this.props.size[0] - m.left - m.right;
    const h = this.props.size[1] - m.top - m.bottom;

    const data = this.props.data;

    const node = this.node;

    const seconds = data.map(d => d.Seconds);
    const ms = data.map(d => d.Seconds * 1000);
    const times = data.map(d => d.Time)

    let formatTime = timeFormat('%M:%S');

    const xScale = scaleLinear()
      .domain([min(seconds), max(seconds) + 3])
      .range([w, 0]);

    const yScale = scaleLinear()
      .domain([0, data.length])
      .range([0, h]);

    const xAxisValues = scaleLinear()
      .domain([0, max(ms) - min(ms) + 3000])
      .range([w, 0]);

    const xAxisTicks = axisBottom(xAxisValues)
      .ticks(10)
      .tickFormat(formatTime);

    const yAxisValues = scaleLinear()
      .domain([1, data.length + 1])
      .range([0, h]);

    const yAxisTicks = axisLeft(yAxisValues)
      .ticks(10);

    const chartCircles = select(node)
      .append('g')
      .attr('id', 'chart_circles')
      .attr('transform', `translate(${m.left}, ${m.top})`)
      .selectAll('circle')
        .data(data)
        .enter()
          .append('circle')
          .attr('class', 'circle')
          .attr('cx', d => xScale(d.Seconds))
          .attr('cy', (d, i) => yScale(i))
          .attr('r', 5)
          .style('fill', d => !d.Doping ?  'green' :  'red')
          .on('mouseover', d => tooltipOver(d))
          .on('mouseout', d => tooltipOut(d));

    const chartLabels = select(node)
      .append('g')
      .attr('id', 'chart_labels')
      .attr('transform', `translate(${m.left}, ${m.top})`)
      .selectAll('text')
        .data(data)
        .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => {
            const xc = xScale(d.Seconds);
            if (xc + 10 < (w / 2)) {
              return xc + 10;
            } else {
              return xc - 10;
            }
          })
          .attr('y', (d, i) => yScale(i) + 4.5)
          .attr('text-anchor', d => {
            const xc = xScale(d.Seconds);
            if (xc + 10 < (w / 2)) {
              return 'start';
            } else {
              return 'end';
            }
          })
          .text(d => `${d.Name} (${d.Year})`)
          .style('font-family', 'sans-serif')
          .style('font-size', '12px')
          .on('mouseover', d => tooltipOver(d))
          .on('mouseout', d => tooltipOut(d));

    const xGuide = select(node)
      .append('g')
      .attr('id', 'xguide')
      .attr('transform', `translate(${m.left}, ${h + m.top})`)
      .call(xAxisTicks);

    const yGuide = select(node)
      .append("g")
      .attr('id', 'yguide')
      .attr('transform', `translate(${m.left}, ${m.top})`)
      .call(yAxisTicks);

    const yGuideLabel = select(node)
      .append('text')
      .text('Ranking')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(m.top))
      .attr('y', m.left + 18)
      .style('text-anchor', 'end')
      .style('font-size', '14px')
      .style('line-height', '1')
      .style('text-transform', 'uppercase');

    const xGuideLabel = select(node)
      .append('text')
      .text('Minutes behind fastest time')
      .attr('x', w + m.left)
      .attr('y', h)
      .style('text-anchor', 'end')
      .style('font-size', '14px')
      .style('text-transform', 'uppercase');

    const chartInfo = select(node)
      .append('g')
      .attr('class', 'chart_info')
      .attr('transform', `translate( ${w * 0.75}, ${h * 0.85} )`);

    const chartInfoFirst = chartInfo.append('g')
      .attr('class', 'chart_info__1st');

    const chartInfoSecond = chartInfo.append('g')
      .attr('class', 'chart_info__2nd')
      .attr('transform', 'translate(0, 18)');

    chartInfoFirst.append('text')
      .attr('class', 'chart_info__text')
      .text('No doping allegations');

    chartInfoFirst.append('circle')
      .attr('r', 5)
      .style('fill', 'green');

    chartInfoSecond.append('text')
      .attr('class', 'chart_info__text')
      .text('Rider with doping allegations');

    chartInfoSecond.append('circle')
      .attr('r', 5)
      .style('fill', 'red');

    const styles = select(node)
      .append('style')
      .text('\
        .chart_info__text { \
          transform: translate(10px, 4px); \
          font-size: 12px; \
          font-weight: normal; \
        } \
        ');

    const tooltip = select('.visual').append('div')
        .attr('class', 'ttip')
        .style('opacity', 0);

    let tooltipOver = (d) => {
      const toolTipDetails = `<div class='ttip__details'>
                                <strong>${d.Name}</strong> (${d.Nationality})<br/>
                                Year: ${d.Year} - Time: <strong>${d.Time}</strong>
                              </div>`;
      const toolTipInfo = `<div class='ttip__info'><a href='${d.URL}' target='_blank'>${d.Doping}</a></div>`;
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(x => !d.Doping ? toolTipDetails : toolTipDetails + toolTipInfo)
      .style('left', `${w * 0.73}px`)
      .style('bottom', `${h * 0.28}px`)
      .style('background', y => !d.Doping ? 'green' : 'red');
    }

    let tooltipOut = () => {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }


  }
  render() {
    return (
      <div className="visual">
        <svg ref={node => this.node = node} width={this.props.size[0]} height={this.props.size[1]} />
      </div>
    );
   }
}
