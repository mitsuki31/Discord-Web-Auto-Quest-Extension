import { ELECTRON_USER_AGENT } from "../constants";

(function() {
  try {
    Object.defineProperty(navigator, 'userAgent', {
      get: function() {
        return ELECTRON_USER_AGENT;
      },
      configurable: true
    });

    Object.defineProperty(navigator, 'platform', {
      get: function() {
        return 'Win32';
      },
      configurable: true
    });

    console.info('[Discord Auto Quest] User-Agent override active:', ELECTRON_USER_AGENT);
  } catch (error) {
    console.error('[Discord Auto Quest] Failed to override user agent:', error);
  }
})();