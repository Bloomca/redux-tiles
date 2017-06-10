import React from 'react';
import PropTypes from 'prop-types';
import Todo from '../todo';
import { connect } from 'react-redux';
import { selectors } from '../../store';

const FILTERS = {
  all: () => true,
  active: ({ completed }) => completed === false,
  completed: ({ completed }) => completed === true,
};

const mapStateToProps = state => ({
  list: selectors.todos.list(state),
  filter: selectors.todos.filter(state),
});

class Todos extends React.Component {
  static propTypes = {
    list: PropTypes.array
  }
  
  render() {
    const { list, filter } = this.props;
    const filterFn = FILTERS[filter];
    return (
      <ul className={'todo-list'}>
        {list.filter(filterFn).map(item => (
          <Todo item={item} key={item.id} />
        ))}
      </ul>
    );
  }
}

export default connect(mapStateToProps)(Todos);
