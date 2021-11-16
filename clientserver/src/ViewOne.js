import React, { Component } from 'react';
import axios from "axios";


class ViewOne extends Component {
    constructor(props) {
        super(props);
        this.state = {id: '', myData: [],lat:'',log:'', ts:'',dt:''};
        }
        
        getOneDeviceData(){
            axios.get(`http://localhost:5050/onedevice?ID=${this.state.id}`)
            .then((response) =>{
              // handle success
              console.log(response);
            if(response){
              let data1 =response.data;
              console.log(data1.date_time);
              this.setState({dt: data1.date_time,lat: data1.lat,log: data1.lng,ts: data1.timestamp_utc})}
            })
 
        }
    render() {
        
        return (
            <div>
                        <label>Select a Device:</label>
                        <input type="text" id="id" name="id"
                            placeholder="Enter an Id"
                            className="form-control py-3 px-3" required="required"
                            onChange={event => {
                            this.setState({id: event.target.value})
                        }}/>
                        <button type="button" className="btn btn-primary btn-lg client-btn" onClick={() => this.getOneDeviceData()}>Get Data
                        </button>

                       <div className= 'd-flex'> <div>Device id </div>:<div>{this.state.id}</div></div>
                       <div className= 'd-flex'><div>Data updated timestamp</div>:<div>{this.state.ts}</div></div>
                       <div className= 'd-flex'><div>Data updated timestamp</div>:<div>{this.state.ts}</div></div>
                       <div className= 'd-flex'><div>Locatiion Longitude</div>:<div>{this.state.log}</div></div>
                       <div className= 'd-flex'><div>Location Latitude</div>:<div>{this.state.lat}</div></div>
                       <div className= 'd-flex'><div>Data processed</div>:<div>{this.state.dt}</div></div>
      </div>
        )
    }
}
export default ViewOne
