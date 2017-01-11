import React from "react";
import 'hammerjs';
import _ from 'lodash';
import Chart from "react-apexcharts";
import {Spin } from 'antd';
import FormDataViewerClient from "../../../../utils/dashboard/form-data-viewer-client";
  
export default class ChartContainer extends React.Component {
    constructor(props){
        super(props);
        this.chartDefaultSetup = {
            options: {
              chart: {
                background: 'white',
                redrawOnParentResize: true,
                height: this.getViewportChartHeight(),                   
                type: 'line',
                stacked: false,
                toolbar: { 
                  show: true,
                  tools: {
                    download: true,
                    selection: true,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false | '<img src="/static/icons/reset.png" width="20">',
                    customIcons: []
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              fill: {
                type:'solid',
              },
              markers: {
                size: 5
              },
              stroke: {
                curve: 'straight',
                width: 3
              },
              title: {
                text: `Smart Rounds (${this.props.config.dateMin} - ${this.props.config.dateMax})`,
                align: 'left',
                offsetX: 15                
              },
              tooltip: {
                shared: false,               
                x: {
                  show: true,
                  format: 'MM/dd/yy hh:mm TT'
                }
              },
              xaxis: {
                type: 'datetime',
                labels: {
                  show: true,
                  showDuplicates: false,
                  datetimeUTC: false,                
                  format: 'MM/dd/yy'
                },
                tooltip: {
                  offsetY: 10
                },
                title:{
                  text: 'Job Scheduled Date',
                  offsetY: 10
                }
              },               
              yaxis: [],               
              legend: {
                showForSingleSeries: true,
                position: 'top',
                horizontalAlign: 'center',
                offsetX: 40
              },
              plotOptions: {
                bar: {                  
                  columnWidth: '20%'
                }
              }
            },                                        
            series: []                 
            
        };

        this.state = {
            height: this.getViewportChartHeight(),
            chartConfig: this.chartDefaultSetup,
            showChart: false,
            generating: false            
        }
    }
    getViewportChartHeight(){
      return Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 170;
    }
    updateChartDimensions = () => {     
      var componentHeight = this.getViewportChartHeight();
      this.setState({
        height: componentHeight
      })
      this.setState(prevState => ({
        chartConfig: {
          ...prevState.chartConfig, 
          options: { 
            ...prevState.chartConfig.options, 
            chart: {
              ...prevState.chartConfig.options.chart, 
              height: componentHeight
            }
           
          }
        }
      }));      
    };

    componentDidMount() {
      this.updateChartDimensions();
      window.addEventListener('resize', this.updateChartDimensions);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateChartDimensions);
    }
    
    componentDidUpdate(prevProps){
        if(_.isEqual(prevProps, this.props)) return;

        if(this.props.config.measurements === null || this.props.config.measurements.length <= 0)  return;
        
        this.setState({generating: true});
        this.setState(prevState => ({
          chartConfig: {
            ...prevState.chartConfig, 
            options: { 
              ...prevState.chartConfig.options, 
              title: {...prevState.chartConfig.options.title, text: `Smart rounds (${this.props.config.dateMin} - ${this.props.config.dateMax})`}
            }
          }
        }));
        var yaxis = [];
        var series = [];
        var promises = [];
        var y1MultiRendered = false;
        var y2MultiRendered = false;
        this.props.config.measurements.forEach(measurement => {
          if(measurement.isIndividual === true){
             yaxis.push(this.getChartScale(measurement.graphScalePosition === 2, true, measurement.measurementName, measurement.measurementName, false))             
          }
          else{           
            var oppositeScale = measurement.graphScalePosition === 2;    
            var name = this.props.config.measurements.some(m => m.measurementUid !== measurement.measurementUid && m.graphScalePosition === measurement.graphScalePosition) ?
              'Multi' : measurement.measurementName;            
            
            yaxis.push(this.getChartScale(oppositeScale, oppositeScale ? !y2MultiRendered : !y1MultiRendered, name, name, true));

            if(y1MultiRendered === false) y1MultiRendered = measurement.graphScalePosition === 1;
            if(y2MultiRendered === false) y2MultiRendered = measurement.graphScalePosition === 2;
          }

          promises.push(FormDataViewerClient.getHistoricalValues(measurement.siteId, measurement.measurementIds, measurement.measurementUid, [this.props.config.dateMin, this.props.config.dateMax]))
          
          series.push({
              name: measurement.measurementName,
              type: measurement.seriesType,
              data: []
          });
        });
         
        Promise.all(promises).then(measurementsData => {            
            yaxis = this.setYAxisMinMax(yaxis, measurementsData);
            this.updateSeries(yaxis, series, measurementsData);
        }).finally(() => {this.setState({ generating: false})});
    }

    setYAxisMinMax(yaxis, measurementsData){
      var delta = 0.05;

      var y1MultiScalingValues = [];
      var y2MultiScalingValues = [];   
      var y1MultiScalingYAxisIndex = []; 
      var y2MultiScalingYAxisIndex = []; 

      measurementsData.forEach((value, index) => {
        var m = this.props.config.measurements[index]
        if(m.isIndividual === false){
          if(m.graphScalePosition === 1) {
            y1MultiScalingValues.push(...value.filter(v => v.value != null).map(v=> parseFloat(v.value)));
            y1MultiScalingYAxisIndex.push(index);
          } else { 
            y2MultiScalingValues.push(...value.filter(v => v.value != null).map(v=> parseFloat(v.value)));
            y2MultiScalingYAxisIndex.push(index);
          };
        }
        else{
          var values = value.filter(v => v.value != null).map(v=> parseFloat(v.value));
          var min = this.getMinValue(values);
          var max = this.getMaxValue(values);

          yaxis[index].min = value.length > 0 ? this.getScaleMinValue(min, delta) : yaxis[index].min;
          yaxis[index].max = value.length > 0 ? this.getScaleMaxValue(max, delta) : yaxis[index].max;
        }
      });
      
      var y1MultiScalingMin = this.getMinValue(y1MultiScalingValues);
      var y1MultiScalingMax = this.getMaxValue(y1MultiScalingValues);

      var y2MultiScalingMin = this.getMinValue(y2MultiScalingValues);
      var y2MultiScalingMax = this.getMaxValue(y2MultiScalingValues);
    

      y1MultiScalingYAxisIndex.forEach(index => {
        yaxis[index].min = y1MultiScalingValues.length > 0 ? this.getScaleMinValue(y1MultiScalingMin, delta) : yaxis[index].min;
        yaxis[index].max = y1MultiScalingValues.length > 0 ? this.getScaleMaxValue(y1MultiScalingMax, delta) : yaxis[index].max;
      });

      y2MultiScalingYAxisIndex.forEach(index => {
        yaxis[index].min = y2MultiScalingValues.length > 0 ? this.getScaleMinValue(y2MultiScalingMin, delta) : yaxis[index].min;
        yaxis[index].max = y2MultiScalingValues.length > 0 ? this.getScaleMaxValue(y2MultiScalingMax, delta) : yaxis[index].max;
      });

      return yaxis;
    }

    getMinValue(values){
      return Math.ceil(Math.min(...values));
    }

    getMaxValue(values){
      return Math.floor(Math.max(...values))
    }
    
    getScaleMinValue(value, delta){
      return Math.ceil(value - value * delta);
    }
    getScaleMaxValue(value, delta){
      return Math.floor(value + value * delta);
    }

    updateScales(yaxis){
      this.setState(prevState => ({
        chartConfig: {
          ...prevState.chartConfig, 
          options: { 
            ...prevState.chartConfig.options, 
            yaxis: yaxis
          },
          series: []
        }
      }));
    }

    updateSeries(yaxis, series, allSeriesData){
      allSeriesData.forEach((response, index) => series[index].data = response.map(v => { 
          return {x: v.date, y: v.value != null ? parseFloat(v.value) : null }          
      }));
    
      this.setState(prevState => ({
        chartConfig: {
          ...prevState.chartConfig,
          options: { 
            ...prevState.chartConfig.options, 
            yaxis: yaxis
          },           
          series: series 
        }
      }));

      this.setState({        
        showChart: true,         
        generating: false
      })
    }

    getChartScale(isOpposite, show, name, title, isMultiScale){    
      var scale = {      
        seriesName: name, 
        show: show, 
        showAlways: true,
        forceNiceScale: true, 
        decimalsInFloat: 0,      
        opposite: isOpposite,
        axisTick: { show: true },
        axisBorder: {show: true, color: '#FEB019'},
        labels: {style: { colors: '#FEB019'}},
        title: { text: title, style: {color: '#FEB019'} }
      };
  
      return scale;
    }

    render () {         
        return (
         
            <div style={{width: 100 + '%', textAlign: 'center', height: this.state.height}}>              
              <Spin spinning={this.state.generating} size="large" tip="Generating...">
                { this.state.showChart ? <Chart height={this.state.height} options={this.state.chartConfig.options} series={this.state.chartConfig.series}/> : null }               
              </Spin>
           </div>            
    )}
  
}