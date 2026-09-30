# Official source and fork 2.0 migration

This fork synchronizes the complete `packages/rainbowkit` tree from official
[RainbowKit 2.2.11](https://github.com/rainbow-me/rainbowkit/releases/tag/%40rainbow-me/rainbowkit%402.2.11),
commit [`0b5f9caf3467cfe848d577d7bdbddb767bbbe930`](https://github.com/rainbow-me/rainbowkit/commit/0b5f9caf3467cfe848d577d7bdbddb767bbbe930).
Both the official GitHub releases and npm `latest` tag reported 2.2.11 when
checked on September 29, 2026. The official main branch at that check had no
additional changes in the RainbowKit package directory. The previous fork was
based on 2.2.10. This is a source synchronization, not just a version bump.

The upstream update brings the components export, renamed Base wallet with its
legacy alias, Anchorage Digital and Meco wallets, mobile/deep-link improvements,
injected-provider fixes, sign-in handling and transaction-store fixes, and their
upstream regression tests. Upstream licensing and attribution are retained.

## Fork-specific changes

The `.hl` primary-name/avatar lookup is retained. Hyperliquid Names take priority
when available and ENS remains the fallback. Regression tests cover both the
priority and fallback, missing avatars and Wagmi 3 balance formatting.

The official release still targets Wagmi 2. This fork additionally migrates to
Wagmi 3, including `useConnectors`, mutation APIs and MetaMask SDK parameters.
`useProfile` constructs the formatted balance field from raw value/decimals.
Injected-provider types are explicit instead of depending on a transitive global
augmentation. Declaration generation fails on errors, and build entry ordering
is sorted for reproducibility.

## Breaking changes for consumers

The fork version is **2.0.0** because it changes the supported wallet stack:

- Install **Wagmi ^3.7.7** and **Viem ^2.56.9** together. An older Viem 2 release
  can lack the Tempo exports consumed by Wagmi 3. React >=18 and TanStack Query
  >=5 remain peers. Development checks use React/ReactDOM 19.3 together.
- Install the optional SDK peers for the wallets you use: MetaMask
  `@metamask/connect-evm`, Coinbase `@coinbase/wallet-sdk`, WalletConnect
  `@walletconnect/ethereum-provider`, Base `@base-org/account`, and Safe
  `@safe-global/safe-apps-provider` / `@safe-global/safe-apps-sdk`. Their supported
  ranges are declared in the package manifest. The development workspace
  supplies each to validate the exported adapters. Root and package development
  peers use matching versions so the example and library share one Wagmi context. For Base in an SSR bundle,
  also supply the Coinbase CDP SDK's optional `@x402/core`, `@x402/evm`,
  `@x402/svm` and `@x402/extensions` peers (^2.25.0); these are declared optional
  peers here and exercised by the example build.
- `geminiWallet` and `portoWallet` exports are removed because Wagmi 3 no longer
  supplies those adapters. Remove them from configured lists or provide a
  separately maintained Wagmi 3 connector. The ten wallets configured by the
  HLnames frontend are retained.
- The upstream `base` wallet rename includes the `baseAccount` alias; existing
  imports continue to work. The `/components` entry point is now available.
- The upstream update adopts `ua-parser-js` 2.x, including its changed package
  license. Review that dependency's license as part of release approval. It has
  not been silently reverted to an older upstream implementation.

For this repository's development/build tooling, use Node **24.21.0** and the
integrity-pinned pnpm **12.6.0**. The workspace enforces a three-day release
cooldown and explicitly permits or declines dependency lifecycle builds. Vite's
Oxc JSX transform and TypeScript bundler resolution are configured explicitly.
The Next example imports the actual HLnames package and keeps its Webpack
externals configuration through explicit `--webpack` commands on Next 16.

## Validation

```sh
pnpm install --frozen-lockfile
pnpm typecheck:package
pnpm test:package
pnpm build:package
pnpm --filter with-next-app build
pnpm --filter @hlnames/rainbowkit pack --pack-destination artifacts
```

The full package test suite passes **109 tests**. One existing enhanced-provider
test is skipped without a Rainbow provider API key; this does not claim live
provider coverage. The five HLnames profile cases are additional to the synced
upstream tests. Declaration generation and all three build entries (main,
wallets, components) are checked. GitHub Actions repeats frozen installation,
package checks, the example build and packaging on Linux. The clean Next 16
example production build passes locally. Webpack still warns about the unused
Wagmi Tempo `accounts` optional import and a transitive dynamic dependency; those
paths are not claimed covered by this example. All four packed entry points and
the license were verified, with no test files in the archive.

Real browser-wallet signing, WalletConnect pairing, funded transactions and the
live HyperEVM name service still require acceptance with configured services.
This PR prepares source and artifacts; merging it does not publish an npm
release. Keep source, lockfile and built package together when rolling back.
