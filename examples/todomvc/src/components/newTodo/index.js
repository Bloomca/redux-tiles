import React from 'react';
import { connect } from 'react-redux';
import { actions } from '../../store';

const mapDispatchToProps = {
  add: actions.todos.list.add,
};

class NewTodo extends React.Component {
  state = {
    text: '',
  }

  changeText = (e) => {
    this.setState({ text: e.target.value });
  }

  handleSubmit = (e) => {
    const { add } = this.props;
    const text = e.target.value.trim()
    if (e.which === 13) {
      add({ text });
      this.setState({ text: '' });
    }
  }

  
  render() {
    const { text } = this.state;
    return (
      <div>
        <input
          className={'new-todo'}
          type={'text'}
          value={text}
          autoFocus={'true'}
          onChange={this.changeText}
          onKeyDown={this.handleSubmit}
        />
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(NewTodo);
