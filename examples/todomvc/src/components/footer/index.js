import React from 'react';
import { connect } from 'react-redux';
import { actions, selectors } from '../../store';

const FILTER_TITLES = {
  all: 'all',
  active: 'active',
  completed: 'completed'
};

const mapStateToProps = state => ({
  list: selectors.todos.list(state),
  filter: selectors.todos.filter(state),
});

const mapDispatchToProps = {
  changeFilter: actions.todos.filter,
  clearCompleted: actions.todos.list.clearCompleted,
};

class Footer extends React.Component {
  renderTodoCount() {
    const { list } = this.props
    const activeCount = list.filter(({ completed }) => completed !== true).length;
    const itemWord = activeCount === 1 ? 'item' : 'items'

    return (
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    );
  }

  renderClearButton() {
    const { list, clearCompleted } = this.props
    const completedCount = list.filter(({ completed }) => completed === true).length;
    if (completedCount > 0) {
      return (
        <button className="clear-completed"
                onClick={clearCompleted} >
          Clear completed
        </button>
      )
    }
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter];
    const { filter: selectedFilter, changeFilter } = this.props;

    return (
      <a className={filter === selectedFilter && 'selected'}
         style={{ cursor: 'pointer' }}
         onClick={() => changeFilter(filter)}>
        {title}
      </a>
    )
  }


  render() {
    return (
      <footer className={'footer'}>
        {this.renderTodoCount()}
        <ul className="filters">
          {['all', 'active', 'completed'].map(filter =>
            <li key={filter}>
              {this.renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this.renderClearButton()}
      </footer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
