# Change Log

## [Unreleased]

### Changed
- fix: unused selectors #97

## [2.0.5] - 2024-01-15
### Changed
- fix: no extra calculation with nested memoized selectors #92

## [2.0.4] - 2023-05-06
### Changed
- fix: use target cache for better performance #72

## [2.0.3] - 2023-04-04
### Changed
- build: disable minification #66

## [2.0.2] - 2023-01-31
### Changed
- fix: nested memoized function usage #64

## [2.0.1] - 2023-01-13
### Changed
- fix: abandon cacheKey and avoid re-running touchAffected on cache #60

## [2.0.0] - 2023-01-05
### Changed
- feat: noWeakMap option #53
- breaking: use named exports #56
- feat(deps): update proxy-compare #57
- feat: memoizeWithArgs util #58
### Migration
```js
// old
import memoize, { getUntrackedObject } from 'proxy-memoize';
// new
import { memoize, getUntracked } from 'proxy-memoize';
```

## [1.2.0] - 2022-08-14
### Changed
- update proxy-compare and re-export replaceNewProxy #48 

## [1.1.0] - 2022-06-14
### Changed
- refactor with array based queue #41
- fix: nested functions with embedded proxies #46
- update proxy-compare #47

## [1.0.0] - 2022-04-13
### Added
- Initial v1 release (code is not changed from v0.3.8)

## [0.3.8] - 2022-03-18
### Changed
- Update proxy-compare

## [0.3.7] - 2021-09-09
### Changed
- CJS build for Node.js (#32)

## [0.3.6] - 2021-08-13
### Changed
- Fix package.json properly for ESM (#27)

## [0.3.5] - 2021-04-29
### Changed
- Fix package.json for React Native (#25)

## [0.3.4] - 2021-05-15
### Changed
- Update proxy-compare v2.0.0 which only changes interanl API names

## [0.3.3] - 2021-03-23
### Changed
- Fix too much caching (#17)

## [0.3.2] - 2021-01-21
### Changed
- Update proxy-compare v1.1.6 which fixes some edge cases

## [0.3.1] - 2020-12-27
### Changed
- Fix a bug with nested memoized functions (#12)

## [0.3.0] - 2020-12-25
### Added
- Re-export getUntrackedObject from proxy-compare

## [0.2.3] - 2020-11-20
### Changed
- Fix incorrect memoization (#7)

## [0.2.2] - 2020-11-02
### Changed
- Refactor and simplify (#6)

## [0.2.1] - 2020-11-01
### Changed
- Support nested memoize (#5)

## [0.2.0] - 2020-10-31
### Changed
- Support nested memoize (#4) incomplete

## [0.1.1] - 2020-10-26
### Changed
- Fix untrack behavior

## [0.1.0] - 2020-10-25
### Added
- Initial release
