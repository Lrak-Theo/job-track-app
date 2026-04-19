import bcrypt from 'bcryptjs';
import * as ExpoCrypto from 'expo-crypto';

bcrypt.setRandomFallback((len) => {
  const buf = ExpoCrypto.getRandomBytes(len);
  return Array.from(buf);
});

export default bcrypt;