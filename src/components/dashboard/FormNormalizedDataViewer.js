import React from "react";
import { camelizeKeys } from "humps";
import moment from 'moment';
import FormDataViewerClient from "../../utils/dashboard/form-data-viewer-client";
import 'antd/dist/antd.css';
import '@progress/kendo-theme-default/dist/all.css';
import { Select, Button, List, Radio, Tooltip, Icon, Drawer, Divider, DatePicker } from "antd";
import ChartContainer from '../dashboard/widgets/smart-rounds/graph';
import HistoricalValues from '../dashboard/widgets/smart-rounds/historical-values';
const { Option } = Select;
const RadioButton = Radio.Button;

const DefaultSelection = {key: 0, label: ''};

const Y1_AXIS_POSITION = 1;
const Y2_AXIS_POSITION = 2;
const DEFAULT_AXIS_POSITION = Y1_AXIS_POSITION;
const DEFAULT_SERIES_TYPE = 'line';

export default class FormNormalizedDataViewer extends React.Component{  
    constructor(props) {
        super(props);

        this.state = {          
          selectedWidget: null,
          isFetching: false,
          sites: [],
          forms: [],
          measurements: [],
          selectedSite: { ...DefaultSelection },          
          selectedForm: { ...DefaultSelection },
          selectedMeasurementUid: null,
          selectedMeasurements: [],

          isY1ScaleTypeIndividual: false,
          isY2ScaleTypeIndividual: false,
          seriesType: DEFAULT_SERIES_TYPE,

          loadingSites: false,
          loadingForms: false,
          loadingMeasurements: false,

          viewingHistoricalDataForMeasurement: null,
          activeHistoricalMeasurementUid: null,
          activeHistoricalSiteId: null,
          activeHistoricalMeasurementName: '',
          activeHistoricalMeasurementIds: [],
          loadingHistoricalValues: false,
          showHistoricalValues: false,

          chartMeasurements: [],        
          chartSetup: {
            chartMeasurements: [],
            dateMin: null,
            dateMax: null,
            seriesType: null
          },
          showFilterDrawer: true,

          dateMin: moment().subtract(14, 'days'),
          dateMax: moment()
        };                 
    };
    
    componentDidMount(){        
        this.loadSites();   
        this.loadForms(this.props.config.activeNode.value);      
    }

    componentDidUpdate(prevProps){
        if(prevProps.largeview !== this.props.largeview){           
            setTimeout(()=>{ window.dispatchEvent(new Event('resize')); }, 300);           
        }
    }

    loadSites(){                       
        this.setState({loadingSites: true});     
        FormDataViewerClient.getSites().then(sites => {  
            var currentSites = camelizeKeys(sites);
            var activeSite = currentSites.find(s => s.siteId === this.props.config.activeNode.value);
            if(activeSite !== null)
            this.setState({
                selectedSite: { key: activeSite.siteId, label: activeSite.siteName }
            });

            this.setState({                 
                sites: currentSites
            });
        }).finally(() => this.setState({loadingSites: false}));                   
    }

    loadForms(siteId){
        this.setState({loadingForms: true});     
        FormDataViewerClient.getForms(siteId).then(forms => {            
            this.setState({              
                forms: camelizeKeys(forms),
                measurements: []
            });
        }).finally(() => this.setState({loadingForms: false})); 
    }

    onSiteChange = site => {          
        this.setState({
            selectedSite: site, 
            selectedForm: { ...DefaultSelection },
            selectedMeasurementUid: null,
            measurements: []
        });
        this.loadForms(site.key);
    };  

    onFormChange = form => {              
        this.setState({loadingMeasurements: true});     
        FormDataViewerClient.getFormMeasurements(this.state.selectedSite.key, form.key).then(measurementsResponse => {            
            this.setState({
                selectedForm: form,
                selectedMeasurementUid: null,
                measurements: camelizeKeys(measurementsResponse)
            });
        }).finally(() => this.setState({loadingMeasurements: false}));  
       
    };

    onMeasurementChange = measurementUid => {
        this.setState({
            selectedMeasurementUid: measurementUid
        });
    }
    getOppositeGraphScale = scalePosition => {
        if(scalePosition === Y1_AXIS_POSITION) 
            return Y2_AXIS_POSITION;
        else
            return Y1_AXIS_POSITION;
    }
    addMeasurement = () => {
        const { measurements } = this.state;
        const { selectedSite, selectedForm, selectedMeasurementUid } = this.state;
        const { selectedMeasurements } = this.state;
     
        var selectedMeasurement = measurements.find(m => m.measurementUid === selectedMeasurementUid);
        var graphScalePosition = selectedMeasurements.filter(m => m.allowsGraph).length === 1 ? 
            this.getOppositeGraphScale(selectedMeasurements.find(m => m.allowsGraph).graphScalePosition) :
            DEFAULT_AXIS_POSITION;

        var measurement = {
            siteId: selectedSite.key,
            siteName: selectedSite.label,
            formId: selectedForm.key,
            formName: selectedForm.label,
            measurementUid: selectedMeasurement.measurementUid,
            measurementName: selectedMeasurement.measurementName,
            measurementIds: selectedMeasurement.measurementIds,
            allowsGraph: selectedMeasurement.isNumeric,
            graphScalePosition: graphScalePosition,
            seriesType: DEFAULT_SERIES_TYPE,
            isIndividual: false                       
        };

        selectedMeasurements.push(measurement);

        this.setState(prev => ({
            selectedMeasurements: selectedMeasurements,
            selectedMeasurementUid: null
        }));
      
    } 

    onMeasurementGraphScalePositionChange = (measurementUid, event) => {   
        var graphScalePosition =  event.target.value;   
        this.setState(prev => ({
            selectedMeasurements: prev.selectedMeasurements.map(m => 
                m.measurementUid === measurementUid 
                    ? {...m, graphScalePosition: graphScalePosition} 
                    : m)
        }));      
    }

   
    onYScaleTypeChange = (axisNumber, isIndividual) => {                      
        if(axisNumber === Y1_AXIS_POSITION){
            this.setState({
                isY1ScaleTypeIndividual: isIndividual
            })
        }
        else{
            this.setState({
                isY2ScaleTypeIndividual: isIndividual
            })
        }
    }  
    onMeasurementSeriesTypeChange(measurementUid, seriesType){
        this.setState(prev => ({
            seriesType: prev.selectedMeasurements.map(m => 
                m.measurementUid === measurementUid 
                    ? {...m, seriesType: seriesType} 
                    : m).every(m => m.seriesType === seriesType) ? seriesType : null,
            selectedMeasurements: prev.selectedMeasurements.map(m => 
                m.measurementUid === measurementUid 
                    ? {...m, seriesType: seriesType} 
                    : m)
        }));   
    }

   
    getYScaleTypeState(currentState, axisPosition, measurements){    
        var seriesCount = measurements.filter(m => m.allowsGraph && m.graphScalePosition === axisPosition).length;
        return seriesCount > 2 ? currentState : (seriesCount < 2)       
    }
    
    removeMeasurement = measurementUid => {             
        this.setState(prev => ({
            selectedMeasurements: prev.selectedMeasurements
                .filter(measurement => measurement.measurementUid !== measurementUid)
        }));         
    };

    generateChart = () => {       
        this.setState(prev => ({  
            chartSetup: {...prev.chartSetup,           
                measurements: prev.selectedMeasurements
                    .filter(m => m.allowsGraph === true)
                    .map(measurement => measurement.graphScalePosition === Y1_AXIS_POSITION 
                    ? {...measurement, isIndividual: prev.isY1ScaleTypeIndividual} 
                    : {...measurement, isIndividual: prev.isY2ScaleTypeIndividual}),
                dateMin: moment(this.state.dateMin).format('MM/DD/YYYY'),
                dateMax: moment(this.state.dateMax).format('MM/DD/YYYY')
            },
            showFilterDrawer: false
        }));      

        this.setState(prev => ({            
            chartMeasurements: prev.selectedMeasurements
                .filter(m => m.allowsGraph === true)
                .map(measurement => measurement.graphScalePosition === Y1_AXIS_POSITION 
                   ? {...measurement, isIndividual: prev.isY1ScaleTypeIndividual} 
                   : {...measurement, isIndividual: prev.isY2ScaleTypeIndividual}),
            showFilterDrawer: false
        }));      
    }

    showMeasurementHistoricalValues = measurementUid => {
        const {selectedMeasurements } = this.state;        
        var measurement = selectedMeasurements.find(m => m.measurementUid === measurementUid);                
        
        this.setState({          
            showHistoricalValues: true,
            viewingHistoricalDataForMeasurement: measurement           
        })        
    };

    hideHistoricalValues() {
        this.setState({
            showHistoricalValues: false,
            viewingHistoricalDataForMeasurement: null
        });
    }

    showFilter(){        
        this.setState({showFilterDrawer: true});
    }

    isYScaleChangeTypeOptionEnabled(axisPosition){
        const { selectedMeasurements } = this.state;
        return selectedMeasurements.filter(m => m.allowsGraph && m.graphScalePosition === axisPosition).length >= 2;
    }

    onGlobalSeriesTypeChange = type => {
        this.setState(prev => ({
            seriesType: type,
            selectedMeasurements: prev.selectedMeasurements.map(m => { return {...m, seriesType: type}})
        }));
    }
    
    onRangeMinDateChange = (date, dateString) => {
        if(date === null) return;
        this.setState({
            dateMin: moment(dateString, 'MM/DD/YYYY')           
        });
    }

    onRangeMaxDateChange = (date, dateString) => {
        if(date === null) return;
        this.setState({
            dateMax: moment(dateString, 'MM/DD/YYYY')           
        });
    }
    
    render () {
        const { sites, forms, measurements } = this.state;
        const { selectedSite, selectedForm, selectedMeasurementUid } = this.state;
        const { selectedMeasurements } = this.state;
        const { loadingSites, loadingForms, loadingMeasurements } = this.state;
        
        const { showHistoricalValues } = this.state;
        
        const siteOptions = sites.map(site => <Option key={site.siteId} value={site.siteId}>{site.siteName}</Option>);
        const formOptions = forms.map(form => <Option key={form.formId} value={form.formId}>{form.formName}</Option>);
        const measurementOptions = measurements
            .filter(measurement => !selectedMeasurements.some(p => p.measurementUid === measurement.measurementUid))
            .map(measurement => <Option key={measurement.measurementUid}>{measurement.measurementName}</Option>);       

        const disableAddMeasurementBtn = selectedMeasurementUid === null;
        const selectionHeader = <div className="row" style={{marginLeft: 0, marginRight: 0}}>
                <div className="col-md-3">
                    <Divider style={{margin: '0 0 10px 0'}}>Date range</Divider>
                    <div className="col-md-12" style={{padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}}>                                              
                        <DatePicker allowClear={false} size='small' format={'MM/DD/YYYY'} key="range-min-date"
                            onChange={this.onRangeMinDateChange}
                            value={this.state.dateMin}/>     
                        <span style={{margin: '0 5px', color: 'lightgray'}}> - </span>                                            
                        <DatePicker allowClear={false} size='small' format={'MM/DD/YYYY'} key="range-max-date"
                            onChange={this.onRangeMaxDateChange}
                            value={this.state.dateMax}/>
                    </div>
                </div>
                <div className="col-md-5">                
                    <Divider style={{margin: '0 0 10px 0'}}>Graph type</Divider> 
                    <div className="col-md-12" style={{padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>                  
                        <Select size="small" style={{width: 90}} 
                            value={this.state.seriesType} 
                            onChange={this.onGlobalSeriesTypeChange}>                                    
                            <Option key={'line'} value={'line'}>{'line'}</Option>
                            <Option key={'scatter'} value={'scatter'}>{'scatter'}</Option>                          
                        </Select>
                    </div>
                </div>
                <div className="col-md-3" style={{fontWeight: 'bold', color: '#8c8c8c', padding: 0}}>
                    <Divider style={{margin: '0 0 10px 0'}}>
                        Y1 scaling<Divider type="vertical" />Y2 scaling
                    </Divider>
                   
                    <div className="col-md-12" style={{padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Select size="small" style={{width: 90}} 
                            value={this.state.isY1ScaleTypeIndividual ? 1 : 0} 
                            onChange={value => this.onYScaleTypeChange(Y1_AXIS_POSITION, value === 1)}>                                    
                            <Option key={0} value={0}>{'single'}</Option>
                            <Option key={1} value={1}>{'multiple'}</Option>                                    
                        </Select>
                
                        <Divider type="vertical" />
                        <Select size="small" style={{width: 90}} 
                            value={this.state.isY2ScaleTypeIndividual ? 1 : 0} 
                            onChange={value => this.onYScaleTypeChange(Y2_AXIS_POSITION, value === 1)}>                                    
                                <Option key={0} value={0}>{'single'}</Option>
                                <Option key={1} value={1}>{'multiple'}</Option>                                    
                            </Select>                       
                    </div>
                    
                </div>             
            </div>
      
        const filter = <div>
                <div className="row">
                    <Select labelInValue className="col-md-3" placeholder="Site..." loading={loadingSites} value={selectedSite} onChange={this.onSiteChange}>{siteOptions}</Select>                                                    
                    <Select labelInValue className="col-md-3" placeholder="Form..." loading={loadingForms} style={{paddingLeft: 5}} value={selectedForm} onChange={this.onFormChange}>{formOptions}</Select> 
                    <Select className="col-md-3" placeholder="Metric..." loading={loadingMeasurements} style={{paddingLeft: 5}} value={selectedMeasurementUid} onChange={this.onMeasurementChange}>{measurementOptions}</Select> 
                    <div className="col-md-3" style={{ paddingLeft: 5, paddingRight: 0}}>
                        <Tooltip title="Add">
                            <Button shape="circle" ghost type="primary" 
                            onClick={this.addMeasurement} 
                            disabled={disableAddMeasurementBtn}                         
                            size={'default'} icon="plus"/>
                        </Tooltip>
                        <Button type="primary" ghost style={{float: 'right'}}
                            hidden={selectedMeasurements.length === 0 || !selectedMeasurements.some(m => m.allowsGraph === true)}
                            onClick={this.generateChart}>Show chart</Button>
                    </div>
                </div> 
            </div>
        return (
            <div style={{ marginRight: -15, marginLeft: -15, position: 'relative'}}>
                  <Button style={{ position: 'absolute', top: 10, right: 10, zIndex: 100}} type="primary" ghost onClick={() => this.showFilter()} 
                    hidden={this.state.showFilterDrawer}>Metrics</Button>
                {/*TODO - refactor using scss variables: height: 'calc(100vh - 170px)' where 170 = TopNavHeight + TopNavPaddingBottom + DashboardPaneHeight  */}
                <div style={{height: 'calc(100vh - 170px)', position: 'relative', overflow: 'hidden'}}>                                             
                <Drawer title={filter}          
                    placement="right"
                    closable={false}    
                    headerStyle={{maxHeight:20 + '%'}}                          
                    bodyStyle={{height:80 + '%', overflowY: 'auto',padding: '24px 10px'}}      
                    height={'100%'} width={100 + '%'}        
                    visible={this.state.showFilterDrawer}
                    getContainer={false}
                    style={{ position: 'absolute', height: '100%' }}>       
                                                        
                    <List size="small" bordered header={selectionHeader}
                        dataSource={selectedMeasurements}
                        rowKey={measurement => measurement.measurementUid}
                        renderItem={measurement => <List.Item className="row" style={{marginLeft: 0, marginRight: 0, paddingTop: 2, paddingBottom: 2 }}>
                            <div className="col-md-8">
                                <span style={{marginRight: 5, fontWeight: 'bold' }}>{measurement.measurementName}</span> 
                                - <span style={{marginRight: 5, color: '#9e9e9e' }}>{measurement.formName}</span>                                                         
                                <span style={{ fontStyle: 'italic', color: '#9e9e9e', display: 'inherit' }}>{measurement.siteName}</span>                                
                            </div>

                           <div className="col-md-3" style={{padding: 0}}>
                                <div className="col-md-12"  hidden={measurement.allowsGraph} style={{padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>   
                                    <span style={{color: 'gray'}}> - not applicable - </span>
                                </div>
                               <div className="col-md-12" hidden={!measurement.allowsGraph} style={{padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>                                                                      
                                    <Radio.Group size="small" 
                                        buttonStyle="solid"
                                        onChange={event => this.onMeasurementGraphScalePositionChange(measurement.measurementUid, event)}                       
                                        defaultValue={measurement.graphScalePosition}>
                                        <RadioButton value={1} style={{padding: '0 40px'}}>Y1</RadioButton>
                                        <RadioButton value={2} style={{padding: '0 40px'}}>Y2</RadioButton>                           
                                    </Radio.Group>                                    
                                </div>                               
                            </div>
                            <Tooltip placement="left" title="Show historical values">
                            <Button type="primary" shape="circle" ghost
                                    onClick={event => this.showMeasurementHistoricalValues(measurement.measurementUid)} 
                                    style={{marginLeft: 10}} size={'default'}>
                                        <Icon type="bars" />
                                    </Button>
                            </Tooltip>
                            <Tooltip placement="top" title="remove">
                            <Button type="danger" shape="circle" icon="delete" ghost
                                    onClick={event => this.removeMeasurement(measurement.measurementUid)} 
                                    style={{marginLeft: 10}} size={'default'}/>
                            </Tooltip>                        
                            </List.Item>}
                    /></Drawer> 

                    <ChartContainer config={this.state.chartSetup} />
                    
                    <HistoricalValues 
                        visible={showHistoricalValues}
                        onHide={() => this.hideHistoricalValues()} 
                        title={this.state.viewingHistoricalDataForMeasurement && this.state.viewingHistoricalDataForMeasurement.measurementName}                        
                        accountSiteId={this.state.viewingHistoricalDataForMeasurement && this.state.viewingHistoricalDataForMeasurement.siteId}
                        measurementIds={this.state.viewingHistoricalDataForMeasurement && this.state.viewingHistoricalDataForMeasurement.measurementIds}
                        measurementUid={this.state.viewingHistoricalDataForMeasurement && this.state.viewingHistoricalDataForMeasurement.measurementUid}
                        dateMin={moment(this.state.dateMin).format('MM/DD/YYYY')}
                        dateMax={moment(this.state.dateMax).format('MM/DD/YYYY')}
                    />
                </div>
            </div>
        );
    }
}