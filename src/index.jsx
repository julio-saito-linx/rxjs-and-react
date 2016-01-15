require("./node_modules/bootstrap/dist/css/bootstrap.min.css")
import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main';

export class App extends React.Component {
	render() {
		return (
      <div>
        <Main />
      </div>
		);
	}
}

ReactDOM.render(<App/>, document.querySelector("#myApp"));
