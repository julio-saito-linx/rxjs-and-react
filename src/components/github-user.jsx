import React from 'react';

export default class GithubUser extends React.Component {
  render() {
    return (
      <div>{this.props.user_name} is my name</div>
    );
  }
}
