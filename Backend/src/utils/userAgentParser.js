/**
 * Simple, dependency-free utility to parse browser and operating system from User-Agent header
 * @param {string} userAgentString - The raw User-Agent header string
 * @returns {object} Object containing { browser, operatingSystem }
 */
export const parseUserAgent = (userAgentString) => {
  if (!userAgentString) {
    return { browser: 'Unknown Browser', operatingSystem: 'Unknown OS' };
  }

  let browser = 'Unknown Browser';
  let operatingSystem = 'Unknown OS';

  const ua = userAgentString.toLowerCase();

  // Parse Operating System
  if (ua.includes('windows phone') || ua.includes('wpdesktop')) {
    operatingSystem = 'Windows Phone';
  } else if (ua.includes('windows')) {
    operatingSystem = 'Windows';
  } else if (ua.includes('macintosh') || ua.includes('mac os x') || ua.includes('mac_powerpc')) {
    // Check if it's iPad/iPhone masquerading as Mac (iPadOS safari)
    if (navigatorHasTouch() && ua.includes('safari')) {
      operatingSystem = 'iPadOS';
    } else {
      operatingSystem = 'macOS';
    }
  } else if (ua.includes('android')) {
    operatingSystem = 'Android';
  } else if (ua.includes('ipad')) {
    operatingSystem = 'iPadOS';
  } else if (ua.includes('iphone')) {
    operatingSystem = 'iOS';
  } else if (ua.includes('linux')) {
    operatingSystem = 'Linux';
  } else if (ua.includes('ubuntu')) {
    operatingSystem = 'Ubuntu';
  } else if (ua.includes('cros')) {
    operatingSystem = 'ChromeOS';
  }

  // Parse Browser
  if (ua.includes('edg/') || ua.includes('edge')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera') || ua.includes('opios')) {
    browser = 'Opera';
  } else if (ua.includes('chrome') || ua.includes('crios') || ua.includes('chromium')) {
    // Make sure it's not actually Edge or Opera which also contain Chrome token
    if (!ua.includes('edg/') && !ua.includes('opr/') && !ua.includes('opios')) {
      browser = 'Chrome';
    }
  } else if (ua.includes('firefox') || ua.includes('fxios')) {
    browser = 'Firefox';
  } else if (ua.includes('safari')) {
    // Chrome, Edge, and Opera contain Safari token, verify they are absent
    if (!ua.includes('chrome') && !ua.includes('chromium') && !ua.includes('edg/') && !ua.includes('opr/') && !ua.includes('opios')) {
      browser = 'Safari';
    }
  } else if (ua.includes('trident') || ua.includes('msie')) {
    browser = 'Internet Explorer';
  }

  return { browser, operatingSystem };
};

// Helper for edge cases on touch devices (primarily modern iPadOS browsers reporting macOS)
function navigatorHasTouch() {
  // Safe fallback for backend node execution where window/navigator doesn't exist
  return false;
}
