import Storage from '../helpers/storage';

interface TransactionConfig {
  namespace: string;
  key_length?: number;
  force_local_storage?: boolean;
  [key: string]: unknown;
}

export interface TransactionSDKOptions {
  transaction: TransactionConfig;
}

export interface TransactionParams {
  state: string;
  code_verifier?: string;
  [key: string]: unknown;
}

export interface TransactionData {
  state?: string;
  code_verifier?: string;
}

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
