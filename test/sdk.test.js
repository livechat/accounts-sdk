import url from 'url';
import expect from 'expect.js';
import qs from 'qs';
import { describe, it } from 'mocha';

import SDK from '../src/sdk';

describe('sdk', function () {
  it('should return correct default URL', function () {
    const sdk = new SDK({client_id: 'c-id'});
    const parsed = url.parse(sdk.authorizeURL());
    const query = qs.parse(parsed.query);
    expect(query.client_id).to.be('c-id');
    expect(query.response_type).to.be('token');
  });
});
