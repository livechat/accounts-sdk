import Storage from '../helpers/storage';
import {
  type TransactionConfig,
  type TransactionSDKOptions,
  type TransactionParams,
  type TransactionData,
} from '../types/transaction';

export default class Transaction {
  options: TransactionConfig;
  private storage: Storage;

  constructor(options: TransactionSDKOptions) {
    this.options = options.transaction;
    this.storage = new Storage(this.options);
  }

  generate(params: TransactionParams): void {
    // 30 minutes
    this.storage.setItem(
      this.options.namespace + params.state,
      {state: params.state, code_verifier: params.code_verifier},
      {expires: 1 / 48}
    );
  }

  get(state: string): TransactionData {
    const transactionData = this.storage.getItem(this.options.namespace + state);
    this.clear(state);
    return (transactionData || {}) as TransactionData;
  }

  clear(state: string): void {
    this.storage.removeItem(this.options.namespace + state);
  }
}
