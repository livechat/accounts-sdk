/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import qs from 'qs';

import Persister from '../persister';
import {type TrackingOptions} from '../../types/sdk';
import {
  type PersisterOptions,
  type PersistParams,
  type RedirectUriParamsData,
} from '../../types/persister';

const attributionKeys = [
  'source_id', 'source_type', 'source_url', 'landing_page', 'referrer',
  'internal_campaign', 'utm_source', 'utm_medium', 'utm_campaign',
  'utm_term', 'utm_content',
] as const satisfies readonly (keyof TrackingOptions)[];

function preserveAttribution(target: qs.ParsedQs, original: qs.ParsedQs): void {
  for (const key of attributionKeys) {
    const value = original[key];
    if (typeof value === 'string' && value !== '') {
      target[key] = value;
    }
  }
}

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
   * Callback params take precedence except for non-empty original attribution values.
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

    preserveAttribution(queryParams, redirectUriParams.query_params ?? {});
    preserveAttribution(hashParams, redirectUriParams.hash_params ?? {});

    let uri = window.location.origin + window.location.pathname;

    if (Object.keys(queryParams).length > 0) {
      uri += '?' + qs.stringify(queryParams);
    }

    if (Object.keys(hashParams).length > 0) {
      uri += '#' + qs.stringify(hashParams);
    }

    window.history.replaceState({}, document.title, uri);
  }
}
