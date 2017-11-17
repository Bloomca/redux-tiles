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
    add: ({ params, getData }) => {
      const list = getData();
      const newItem = {
        ...params,
        completed: false,
        id: createId()
      };

      return list.concat(newItem);
    },
    remove: ({ params, getData }) => getData().filter(item => item.id !== params.id),
    toggle: ({ params, getData }) => getData().map(
      todo => todo.id === params.id
        ? { ...todo, completed: !todo.completed }
        : todo
    ),
    clearCompleted: ({ params, getData }) => getData().filter(({ completed }) => completed === false)
  },
  initialState: [],
});

export default [todosTile, filterTile];
