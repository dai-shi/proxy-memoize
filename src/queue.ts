export class CircularQueue<T> {
  _data: T[];

  _size: number;

  _tail: number;

  _head: number;

  constructor(size: number) {
    this._data = Array(size + 1);
    this._size = size + 1;
    this._tail = 1;
    this._head = 0;
  }

  get(i: number) {
    return this._data[(this._head + i + 1) % this._size];
  }

  size() {
    return (this._tail - this._head + this._size - 1) % this._size;
  }

  enqueue(val: T) {
    if (this.full()) {
      this.dequeue();
    }
    this._data[this._tail] = val;
    this._tail = (this._tail + 1) % this._size;
    return true;
  }

  private dequeue() {
    // We only use the enqueue method, so dequeue don't need to check empty
    // if(this.empty()) return false;
    this._head = (this._head + 1) % this._size;
    this._data[this._head] = undefined as unknown as T;
    return true;
  }

  empty() {
    return (this._head + 1) % this._size === this._tail;
  }

  full() {
    return this._head === this._tail;
  }
}
