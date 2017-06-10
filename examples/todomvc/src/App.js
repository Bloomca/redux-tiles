import React, { Component } from 'react';
import NewTodo from './components/newTodo';
import MainSection from './components/main';
import 'todomvc-app-css/index.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <NewTodo />
        <MainSection />
      </div>
    );
  }
}

export default App;
