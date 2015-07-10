import Store from '../store/store';
import request from '../request/request';
import sorts from './topic-sorts';
import Storage from '../storage/storage';

const storage = new Storage;

class TopicStore extends Store {
  constructor () {
    super();

    this._findAllSortedCache = {
      url: null,
      items: []
    };

    this.setSort(storage.get('topic-store-sort') || 'closing-soon');
  }

  name () {
    return 'topic';
  }

  publish (id) {
    if (!this.item.get(id)) {
      return Promise.reject(new Error('Cannot publish not fetched item.'));
    }

    let pub = new Promise((resolve, reject) => {
      request
        .post(`${this.url(id)}/publish`)
        .end((err, res) => {
          if (err || !res.ok) return reject(err);

          let item = this.parse(res.body);
          this.item.set(id, item);

          resolve(item);

          this.busEmit(`update:${id}`, item);
        });
    });

    return pub;
  }

  findAll (...args) {
    let r = super.findAll(...args);
    r.then(() => { this._findAllSort(); });
    return r;
  }

  findAllSorted (...args) {
    if (this._findAllCache.url && this._findAllCache.url === this._findAllSortedCache.url) {
      return Promise.resolve(this._findAllSortedCache.items);
    }

    return this.findAll(...args).then(() => {
      this._findAllSort();
      return this._findAllSortedCache.items;
    }).catch(err => { throw err; });
  }

  _findAllSort () {
    let items = this._findAllCache.items.slice(0).sort(this._sortFn);

    this._findAllSortedCache = {
      url: this._findAllCache.url,
      items: items
    };

    this.busEmit('all:sort:update', items);
  }

  setSort (by) {
    if (!sorts[by]) throw new Error(`Sort '${by}' does not exist.`);
    storage.set('topic-store-sort', by);
    this._sortFn = sorts[by];
    this._findAllSort();
    return this;
  }
}

export default new TopicStore();