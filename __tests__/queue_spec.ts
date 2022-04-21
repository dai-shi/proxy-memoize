import { CircularQueue } from '../src/queue';

describe('basic spec', () => {
  it('enqueue and dequeue', () => {
    const q = new CircularQueue(3);
    expect(q.empty()).toEqual(true);
    expect(q.full()).toEqual(false);
    expect(q.size()).toEqual(0);
    q.enqueue(0);
    expect(q.empty()).toEqual(false);
    expect(q.full()).toEqual(false);
    expect(q.size()).toEqual(1);
    q.enqueue(1);
    q.enqueue(2);
    expect(q.empty()).toEqual(false);
    expect(q.full()).toEqual(true);
    expect(q.size()).toEqual(3);
    q.enqueue(3);
    q.enqueue(4);
    expect(q.empty()).toEqual(false);
    expect(q.full()).toEqual(true);
    expect(q.size()).toEqual(3);
    q.dequeue();
    q.dequeue();
    q.dequeue();
    q.dequeue();
    expect(q.empty()).toEqual(true);
    expect(q.full()).toEqual(false);
    expect(q.size()).toEqual(0);
  });

  it('get item', () => {
    const q = new CircularQueue(3);
    q.enqueue(0);
    q.enqueue(1);
    q.enqueue(2);
    const list1 = [0, 1, 2];
    for (let i = 0; i < q.size(); i += 1) {
      expect(q.get(i)).toEqual(list1[i]);
    }
    q.enqueue(3);
    q.enqueue(4);
    const list2 = [2, 3, 4];
    for (let i = 0; i < q.size(); i += 1) {
      expect(q.get(i)).toEqual(list2[i]);
    }
  });
});
