import { describe, expect, it } from 'vitest';
import type { WindowProvider } from '../../../types/utils';
import { metaMaskWallet } from './metaMaskWallet';

const projectId = 'test-id';

describe('isMetaMask', () => {
  it('returns undefined for impersonating wallet flags', () => {
    (
      window as Window & {
        ethereum?: Partial<NonNullable<WindowProvider['ethereum']>>;
      }
    ).ethereum = { isMetaMask: true, isSafePal: true } as any;
    const wallet = metaMaskWallet({ projectId });
    expect(wallet.installed).toBeUndefined();
  });
});
