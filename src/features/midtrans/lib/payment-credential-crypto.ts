import type { EncryptedPaymentSettingsRequest } from '@/features/onboarding/api/types';

type CredentialFields = Omit<EncryptedPaymentSettingsRequest, 'session_id' | 'is_sandbox'>;

interface KeyExchangeResult {
  sessionId: string;
  encryptedFields: CredentialFields;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function uuidToBytes(uuid: string) {
  const hex = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return bytes;
}

async function encryptCredential(plaintext: string, key: CryptoKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    new TextEncoder().encode(plaintext)
  );
  const output = new Uint8Array(nonce.length + encrypted.byteLength);
  output.set(nonce);
  output.set(new Uint8Array(encrypted), nonce.length);
  return bytesToBase64(output);
}

export async function encryptPaymentCredentials(
  values: CredentialFields,
  initiateKeyExchange: (clientPublicKey: string) => Promise<{
    session_id: string;
    server_public_key: string;
  }>
): Promise<KeyExchangeResult> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Browser tidak mendukung enkripsi credential.');
  }

  const keyPair = (await crypto.subtle.generateKey({ name: 'X25519' }, true, [
    'deriveBits'
  ])) as CryptoKeyPair;
  const publicKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const clientPublicKey = bytesToBase64(new Uint8Array(publicKey));
  const { session_id: sessionId, server_public_key: serverPublicKey } =
    await initiateKeyExchange(clientPublicKey);

  const serverPublicCryptoKey = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(serverPublicKey),
    { name: 'X25519' },
    false,
    []
  );
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'X25519', public: serverPublicCryptoKey },
    keyPair.privateKey,
    256
  );
  const hkdfKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, [
    'deriveBits'
  ]);
  const aesKeyRaw = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: uuidToBytes(sessionId)
    },
    hkdfKey,
    256
  );
  const aesKey = await crypto.subtle.importKey('raw', aesKeyRaw, { name: 'AES-GCM' }, false, [
    'encrypt'
  ]);
  const encryptedFields: CredentialFields = {};

  for (const [field, value] of Object.entries(values)) {
    if (value?.trim()) {
      encryptedFields[field as keyof CredentialFields] = await encryptCredential(value, aesKey);
    }
  }

  return { sessionId, encryptedFields };
}
