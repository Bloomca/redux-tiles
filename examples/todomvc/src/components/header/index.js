import React from 'react';
import NewTodo from '../newTodo';

export default class Header extends React.Component {
  render() {
    return (
      <header className={'header'}>
        <h1>
          {'Todos'}
        </h1>
        <NewTodo />
      </header>
    );
  }
}