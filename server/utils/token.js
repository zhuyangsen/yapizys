const yapi = require('../yapi')

const crypto = require('crypto');

const ALGORITHM = 'aes-192-cbc';
const KEY_LENGTH = 24; // aes-192 needs 24-byte key
const IV_LENGTH = 16;  // CBC mode needs 16-byte IV

/**
 * Derive a deterministic key and IV from a password using scrypt.
 * This replaces the deprecated createCipher(password) pattern which
 * auto-derived (key, iv) via OpenSSL's EVP_BytesToKey.
 */
function deriveKeyAndIv(password) {
  const key = crypto.scryptSync(password, 'ypi-key-salt', KEY_LENGTH);
  const iv = crypto.scryptSync(password, 'ypi-iv-salt', IV_LENGTH);
  return { key, iv };
}

// 创建加密算法
const aseEncode = function(data, password) {
  const { key, iv } = deriveKeyAndIv(password);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
};

// 创建解密算法
const aseDecode = function(data, password) {
  const { key, iv } = deriveKeyAndIv(password);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};

const defaultSalt = 'abcde';

exports.getToken = function getToken(token, uid){
  if(!token)throw new Error('token 不能为空')
  yapi.WEBCONFIG.passsalt = yapi.WEBCONFIG.passsalt || defaultSalt;
  return aseEncode(uid + '|' + token, yapi.WEBCONFIG.passsalt)
}

exports.parseToken = function parseToken(token){
  if(!token)throw new Error('token 不能为空')
  yapi.WEBCONFIG.passsalt = yapi.WEBCONFIG.passsalt || defaultSalt;
  let tokens;
  try{
    tokens = aseDecode(token, yapi.WEBCONFIG.passsalt)
  }catch(e){}  
  if(tokens && typeof tokens === 'string' && tokens.indexOf('|') > 0){
    tokens = tokens.split('|')
    return {
      uid: tokens[0],
      projectToken: tokens[1]
    }
  }
  return false;
  
}

