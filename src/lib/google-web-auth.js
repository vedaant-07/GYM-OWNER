export const GOOGLE_WEB_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || '10666408411-4t6tm45luqqa1q8la40f8q44r5js1rik.apps.googleusercontent.com';

let googleScriptPromise = null;

function currentOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

function googleSetupMessage(reason = '') {
  const origin = currentOrigin();
  return [
    reason || 'Google sign-in could not start.',
    origin ? `Add this exact website origin in Google Cloud Authorized JavaScript origins: ${origin}` : '',
    'Use the Web OAuth Client ID, not the Android client ID.',
  ].filter(Boolean).join(' ');
}

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google login script failed to load. Check browser extensions or network blocking.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services loaded but was not available.'));
      }
    };
    script.onerror = () => reject(new Error('Google login script failed to load. Check browser extensions or network blocking.'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export async function renderGoogleSignInButton({ element, onCredential, onError }) {
  if (!element) return;

  if (!GOOGLE_WEB_CLIENT_ID) {
    onError?.('Google Web Client ID is missing. Add VITE_GOOGLE_WEB_CLIENT_ID in website env.');
    return;
  }

  try {
    const google = await loadGoogleIdentityScript();
    element.innerHTML = '';

    google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback: async (response) => {
        if (!response?.credential) {
          onError?.('Google did not return a credential. Please try again or use email login.');
          return;
        }
        await onCredential(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
    });

    google.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: Math.min(element.offsetWidth || 478, 480),
    });
  } catch (error) {
    onError?.(googleSetupMessage(error.message));
  }
}

export function getGoogleSetupInstructions() {
  return googleSetupMessage('Google OAuth origin is not configured for this website.');
}
