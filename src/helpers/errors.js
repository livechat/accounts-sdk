export default {
  extend: function (error) {
    if (error.oauth_exception && this.oauth_exception[error.oauth_exception]) {
      return Object.assign(error, {
        description: this.oauth_exception[error.oauth_exception],
      });
    }

    if (
      error.identity_exception &&
      this.identity_exception[error.identity_exception]
    ) {
      return Object.assign(error, {
        description: this.identity_exception[error.identity_exception],
      });
    }

    return error;
  },
  oauth_exception: {
    invalid_request:
      'You may be loading accounts-sdk on a domain that is not whitelisted.',

    unauthorized_client:
      'Client not found, not provided or incorectly configured.',

    access_denied:
      'Probably this application is installed on a different account and you do not have access to it.',

    unsupported_response_type:
      'Provided response type is incorrect or unavailable for a given client.',
  },
  identity_exception: {
    unauthorized: 'Resource owner identity is not known or consent is missing.',
  },
};
