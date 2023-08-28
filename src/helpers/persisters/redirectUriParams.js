/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import qs from 'qs';

import Persister from '../persister';

export default class RedirectUriParamsPersister {
  constructor(options) {
    this.persister = new Persister(options, 'redirect_uri_params');
  }

  persist(params) {
    const redirectUrl = new URL(params.redirect_uri);
    const queryParams = qs.parse(redirectUrl.search.substring(1));
    const hashParams = qs.parse(redirectUrl.hash.substring(1));

    this.persister.set(params.state, {
      query_params: queryParams,
      hash_params: hashParams,
    });

    params.redirect_uri = redirectUrl.origin + redirectUrl.pathname;
  }

  retrieve(state) {
    const redirectUriParams = this.persister.get(state, false);

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

    console.log('queryParams: ', queryParams);
    console.log('hashParams: ', hashParams);

    let uri = window.location.origin + window.location.pathname;

    if (queryParams) {
      135;
      uri += '?' + qs.stringify(queryParams);
    }

    if (hashParams) {
      uri += '#' + qs.stringify(hashParams);
    }

    console.log(uri);

    window.history.replaceState({}, document.title, uri);
  }
}
