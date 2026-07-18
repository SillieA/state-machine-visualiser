'use client';
import { deflate, inflate } from 'pako';
import type { SavedJSM } from '@/lib/libraryStore';

function urlSafeEncode(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function urlSafeDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (str.length % 4);
  if (padding !== 4) {
    str += '='.repeat(padding);
  }
  return str;
}

export function encodeJSM(jsm: SavedJSM): string {
  const json = JSON.stringify(jsm);
  const utf8Bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const b64 = btoa(binary);
  return urlSafeEncode(b64);
}

export function decodeJSM(encoded: string): SavedJSM | null {
  try {
    const b64 = urlSafeDecode(encoded);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);

    const result = JSON.parse(json) as SavedJSM;
    return result;
  } catch (error) {
    console.error('Error decoding JSM:', error);
    return null;
  }
}

export function encodeJSMCompressed(jsm: SavedJSM): string {
  const json = JSON.stringify(jsm);
  const compressed = deflate(json);
  const binary = String.fromCharCode(...compressed);
  const b64 = btoa(binary);
  return urlSafeEncode(b64);
}

export function decodeJSMCompressed(encoded: string): SavedJSM | null {
  try {
    const b64 = urlSafeDecode(encoded);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = inflate(bytes, { toText: true });
    const result = JSON.parse(json) as SavedJSM;
    return result;
  } catch (error) {
    console.error('Error decoding compressed JSM:', error);
    return null;
  }
}
