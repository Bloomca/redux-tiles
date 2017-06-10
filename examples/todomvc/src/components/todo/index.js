import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { actions } from '../../store';

const mapDispatchToProps = {
  toggle: actions.todos.list.toggle,
  remove: actions.todos.list.remove,
};

class Todo extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.string,
      text: PropTypes.string,
      completed: PropTypes.bool,
    }).isRequired,
    toggle: PropTypes.func,
  }

  state = {
    editing: false
  }

  handleDoubleClick = () => {
    this.setState({ editing: true })
  }

  toggleItem = () => {
    const { item, toggle } = this.props;
    toggle(item);
  }

  removeItem = () => {
    const { item, remove } = this.props;
    remove(item);
  }

  renderElement() {
    const { item } = this.props;
    return (
      <div className="view">
        <input className="toggle"
                type="checkbox"
                checked={item.completed}
                onChange={this.toggleItem} />
        <label onDoubleClick={this.handleDoubleClick}>
          {item.text}
        </label>
        <button className="destroy"
                onClick={this.removeItem} />
      </div>
    );
  }
  
  render() {
    const { item } = this.props;
    const itemClassName = `
      ${item.completed ? 'completed' : ''}
    `;
    return (
      <li onClick={this.toggleItem} className={itemClassName}>
        {this.renderElement()}
      </li>
    );
  }
}

export default connect(null, mapDispatchToProps)(Todo);