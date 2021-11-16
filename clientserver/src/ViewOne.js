import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket('ws://127.0.0.1:3030');

class ViewOne extends Component {
    constructor(props) {
        super(props);
        this.state = {dataFromServer: []};
        }
    componentDidMount() {
        client.onopen = () => {
            console.log('WebSocket Client Connected');
            };
        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            console.log(dataFromServer);
            dataFromServer.map((data)=>{console.log(data);
            this.setState({dataFromServer: dataFromServer})});
          
            };
    }
    render() {
        console.log(this.state.dataFromServer)
        return (
            <div>
      {this.state.dataFromServer.map((data) =>(<div>{`${data.id}: ${data.date_time}`}</div>))}
      </div>
        )
    }
}
export default ViewOne
