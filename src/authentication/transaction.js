/* eslint-disable require-jsdoc */
/* internal file */
import random from '../helpers/random';
import Storage from '../helpers/storage';

export default class Transaction {
  constructor(options) {
    this.options = options.transaction;
    this.storage = new Storage(this.options);
  }

  generate(params) {
    if (!params.state) {
      params.state = random.string(this.options.key_length);
    }

    // 30 minutes
    this.storage.setItem(
      this.options.namespace + params.state,
      {state: params.state, code_verifier: params.code_verifier},
      {expires: 1 / 48}
    );
  }

  get(state) {
    const transactionData = this.storage.getItem(
      this.options.namespace + state
    );
    this.clear(state);
    return transactionData || {};
  }

  clear(state) {
    this.storage.removeItem(this.options.namespace + state);
  }
}
