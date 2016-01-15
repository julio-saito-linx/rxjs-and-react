import React from 'react';
import GithubUser from './github-user';

export default class Main extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello, world.</h1>
        <GithubUser user_name="John" />
      </div>

    );
  }
}
