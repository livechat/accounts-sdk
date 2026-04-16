/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import qs from 'qs';

import Persister from '../persister';
import {
  type PersisterOptions,
  type PersistParams,
  type RedirectUriParamsData,
} from '../../types/persister';

export default class RedirectUriParamsPersister {
  persister: Persister;

  constructor(options: PersisterOptions) {
    this.persister = new Persister(options, 'redirect_uri_params');
  }

  /**
   * Clears query and hash params from redirect_uri and persists them in storage.
   */
  persist(params: PersistParams): void {
    const redirectUrl = new URL(params.redirect_uri);
    const queryParams = qs.parse(redirectUrl.search.substring(1));
    const hashParams = qs.parse(redirectUrl.hash.substring(1));

    this.persister.set(params.state, {
      query_params: queryParams,
      hash_params: hashParams,
    });

    params.redirect_uri = redirectUrl.origin + redirectUrl.pathname;
  }

  /**
   * Retrieves persisted query and hash params from storage and updates current location accordingly.
   * Params returned by global accounts overrides persisted params in case of duplications.
   */
  retrieve(state: string): void {
    const redirectUriParams = this.persister.get<RedirectUriParamsData>(state);

    if (!redirectUriParams) {
      return;
    }

    const queryParams = {
      ...(redirectUriParams.query_params ?? {}),
      ...qs.parse(window.location.search.substring(1)),
    };

    const hashParams = {
      ...(redirectUriParams.hash_params ?? {}),
      ...qs.parse(window.location.hash.substring(1)),
    };

    let uri = window.location.origin + window.location.pathname;

    if (queryParams) {
      uri += '?' + qs.stringify(queryParams);
    }

    if (hashParams) {
      uri += '#' + qs.stringify(hashParams);
    }

    window.history.replaceState({}, document.title, uri);
  }
}
