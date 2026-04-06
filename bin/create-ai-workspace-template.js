#!/usr/bin/env node
/**
 * npm `bin` 진입점. 구현은 `src/index.js` (Windows 등에서 `bin`이 `src/*.js`만 직접 가리키면 shim 이슈가 있을 수 있어 thin wrapper 유지).
 */
import '../src/index.js';
