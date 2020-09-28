import SDK from '../src/sdk';
import url from 'url';
import expect from 'expect.js';
import qs from 'qs';

describe('sdk', function () {
  it('should return correct default URL', function () {
    const sdk = new SDK({client_id: 'c-id'});
    const parsed = url.parse(sdk.authorizeURL());
    const query = qs.parse(parsed.query);
    expect(query.client_id).to.be('c-id');
    expect(query.response_type).to.be('token');
  });
});
