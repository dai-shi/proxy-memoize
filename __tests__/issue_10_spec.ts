import { memoize } from '../src/index';

describe('issue #10', () => {
  it('todos filter status', () => {
    type State = {
      todos: { id: number, text: string }[],
      filters: { status: string },
    };
    const state1: State = {
      todos: [{ id: 1, text: 'aaa' }],
      filters: { status: 'all' },
    };
    const state2: State = {
      ...state1,
      todos: [...state1.todos, { id: 2, text: 'bbb' }],
    };

    const selectFilteredTodos = memoize((state: State) => {
      const { status } = state.filters;
      const { todos } = state;

      const showAllCompletions = status === 'all';
      if (showAllCompletions) {
        return todos;
      }

      return [];
    });

    const selectFilteredTodoIds = memoize((state: State) => (
      selectFilteredTodos(state).map((todo) => todo.id)
    ));

    selectFilteredTodoIds(state1);
    selectFilteredTodoIds(state2);
  });
});
