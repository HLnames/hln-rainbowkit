import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfile } from './useProfile';

const mocks = vi.hoisted(() => ({
  balance: vi.fn(),
  ensName: vi.fn(),
  ensAvatar: vi.fn(),
  hlnames: vi.fn(),
}));
vi.mock('wagmi', () => ({ useBalance: mocks.balance }));
vi.mock('./useMainnetEnsName', () => ({ useMainnetEnsName: mocks.ensName }));
vi.mock('./useMainnetEnsAvatar', () => ({
  useMainnetEnsAvatar: mocks.ensAvatar,
}));
vi.mock('./useMainnetHyperliquidNames', () => ({
  useMainnetHyperliquidNames: mocks.hlnames,
}));

const address = '0x0000000000000000000000000000000000000001';

describe('HLnames profile on Wagmi 3', () => {
  beforeEach(() => {
    mocks.balance.mockReturnValue({ data: undefined });
    mocks.ensName.mockReturnValue('alice.eth');
    mocks.ensAvatar.mockReturnValue('https://example.com/ens.png');
    mocks.hlnames.mockReturnValue(undefined);
  });

  it('prefers Hyperliquid names and avatars over ENS', () => {
    mocks.hlnames.mockReturnValue({
      name: 'alice.hl',
      avatar: 'https://example.com/hl.png',
    });
    const { result } = renderHook(() => useProfile({ address }));
    expect(result.current).toMatchObject({
      ensName: 'alice.hl',
      ensAvatar: 'https://example.com/hl.png',
    });
  });

  it('retains ENS fallback when the Hyperliquid lookup has no result', () => {
    const { result } = renderHook(() => useProfile({ address }));
    expect(result.current).toMatchObject({
      ensName: 'alice.eth',
      ensAvatar: 'https://example.com/ens.png',
    });
  });

  it('falls back to the ENS avatar when only an HL name is available', () => {
    mocks.hlnames.mockReturnValue({ name: 'alice.hl', avatar: null });
    const { result } = renderHook(() => useProfile({ address }));
    expect(result.current).toMatchObject({
      ensName: 'alice.hl',
      ensAvatar: 'https://example.com/ens.png',
    });
  });

  it('formats the native balance returned by Wagmi 3', () => {
    mocks.balance.mockReturnValue({
      data: {
        value: BigInt('1234500000000000000'),
        decimals: 18,
        symbol: 'HYPE',
      },
    });
    const { result } = renderHook(() =>
      useProfile({ address, includeBalance: true }),
    );
    expect(result.current.balance).toMatchObject({
      formatted: '1.2345',
      symbol: 'HYPE',
    });
    expect(mocks.balance).toHaveBeenLastCalledWith({ address });
  });

  it('does not invent a balance before the read succeeds', () => {
    const { result } = renderHook(() =>
      useProfile({ address, includeBalance: false }),
    );
    expect(result.current.balance).toBeUndefined();
    expect(mocks.balance).toHaveBeenLastCalledWith({ address: undefined });
  });
});
