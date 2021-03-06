import React, { Component } from 'react';

import "bootstrap/dist/css/bootstrap.min.css";
import ViewAll from './ViewAll';
import ViewOne from './ViewOne';



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {homepage: true};
    }

  
  render() {
    // console.log(this.state.dataFromServer)
    return (<>
    <div >
{this.state.homepage?<div className='d-flex justify-content-around '><ViewAll/>
<div className="mb-2">
<button id="viewbyid" className="btn btn-primary btn-xl my-50 text-uppercase save-btn"
                                onClick={() => this.setState({homepage:false})}> View by Id
                        </button></div>
  </div>:<div><ViewOne/>
  <button id="back2Home" className="btn btn-primary btn-xl my-50 text-uppercase save-btn"
                                onClick={() => this.setState({homepage:true})}> Back to View All
                        </button></div>}
   </div>
  </>
    );
  }
}

export default App;