import { createSyncTile } from 'redux-tiles';


function createRandomChar() {
  const number = 97 + Math.floor(Math.random() * 25);
  return String.fromCharCode(number);
}

function createId() {
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += createRandomChar();
  }

  return id;
}


export const filterTile = createSyncTile({
  type: ['todos', 'filter'],
  initialState: 'all',
});

export const todosTile = createSyncTile({
  type: ['todos', 'list'],
  fns: {
    add: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      const newItem = {
        ...params,
        completed: false,
        id: createId()
      };

      return list.concat(newItem);
    },
    remove: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      return list.filter(item => item.id !== params.id);
    },
    toggle: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      return list.map(todo => todo.id === params.id
        ? { ...todo, completed: !todo.completed }
        : todo
      );
    },
    clearCompleted: ({ params, selectors, getState }) => {
      const list = selectors.todos.list(getState());
      return list.filter(({ completed }) => completed === false);
    }
  },
  initialState: [],
});

export default [todosTile, filterTile];
