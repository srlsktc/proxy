const crypto = require('crypto');

class ApiSigner {
  constructor(privateKey) {
    this.privateKeyObject = crypto.createPrivateKey({
      key: privateKey,
      type: 'pkcs1',
      format: 'pem',
      encoding: 'base64',
    });
  }

  sign(payload) {
    return crypto.sign('sha256', Buffer.from(payload), this.privateKeyObject).toString('base64');
  }
}

module.exports = ApiSigner;
