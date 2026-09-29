/**
 * TOMÉA PERFUMES - Admin Authentication Service
 *
 * Protects admin routes and manages administrator sessions via Firebase Auth.
 * Falls back gracefully to a demo session when the Firebase user hasn't been
 * created yet in the Firebase Console.
 */

class AuthService {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this._authStateResolved = false;
    this._authStatePromise = null;
    this.init();
  }

  init() {
    if (window.firebase && typeof window.isFirebaseConfigured === 'function' && window.isFirebaseConfigured()) {
      try {
        this.auth = firebase.auth();

        // Create a promise that resolves once Firebase auth state is known
        this._authStatePromise = new Promise((resolve) => {
          const unsubscribe = this.auth.onAuthStateChanged((user) => {
            unsubscribe();
            this.currentUser = user;
            this._authStateResolved = true;
            this.updateUiState(user);
            resolve(user);
          });
        });
        return;
      } catch (e) {
        console.warn('[TOMÉA Auth] Firebase Auth initialization failed, falling back:', e);
      }
    }

    // No Firebase — resolve immediately from session storage
    this._authStateResolved = true;
    this._authStatePromise = Promise.resolve(null);

    const demoSession = sessionStorage.getItem('tomea_admin_session');
    if (demoSession) {
      try {
        this.currentUser = JSON.parse(demoSession);
        this.updateUiState(this.currentUser);
      } catch (e) {
        sessionStorage.removeItem('tomea_admin_session');
      }
    }
  }

  updateUiState(user) {
    const adminEmailEls = document.querySelectorAll('.js-admin-email');
    if (adminEmailEls) {
      adminEmailEls.forEach(el => {
        el.textContent = user ? (user.email || 'Administrator') : 'Guest';
      });
    }
  }

  /**
   * Log in administrator.
   * Tries Firebase first; falls back to demo session if the Firebase user
   * hasn't been created yet in the Firebase Console.
   */
  async login(email, password) {
    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Please enter both your administrator email and password.');
    }

    // 1. Firebase Auth is configured — try it first
    if (this.auth) {
      try {
        const userCredential = await this.auth.signInWithEmailAndPassword(cleanEmail, cleanPassword);
        this.currentUser = userCredential.user;
        return { success: true, user: this.currentUser };
      } catch (error) {
        // If Firebase user doesn't exist yet, allow the demo fallback
        const isUserNotFound =
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/invalid-email';

        if (!isUserNotFound) {
          // Real errors — wrong password, too many attempts, etc.
          let msg = 'Authentication failed. Please check your credentials.';
          if (error.code === 'auth/wrong-password') {
            msg = 'Invalid password. Please try again.';
          } else if (error.code === 'auth/too-many-requests') {
            msg = 'Access temporarily locked due to multiple failed attempts. Please try again later.';
          }
          throw new Error(msg);
        }

        // User not found in Firebase yet — try demo fallback below
        console.info('[TOMÉA Auth] Firebase user not found — trying demo session fallback.');
      }
    }

    // 2. Demo fallback (works when Firebase user hasn't been created yet,
    //    or when Firebase is not configured at all)
    if (
      cleanEmail === 'admin@tomeaperfumes.com' &&
      (cleanPassword === 'TomeaLuxury2026!' || cleanPassword === 'admin123')
    ) {
      const demoUser = {
        uid: 'demo_admin_tomea',
        email: cleanEmail,
        displayName: 'Maison Administrator',
        role: 'superadmin'
      };
      this.currentUser = demoUser;
      sessionStorage.setItem('tomea_admin_session', JSON.stringify(demoUser));
      return { success: true, user: demoUser };
    }

    throw new Error('Invalid administrator email or password.');
  }

  /**
   * Log out administrator
   */
  async logout() {
    if (this.auth) {
      try {
        await this.auth.signOut();
      } catch (e) {
        console.warn('[TOMÉA Auth] Sign out error:', e);
      }
    }
    sessionStorage.removeItem('tomea_admin_session');
    this.currentUser = null;
    window.location.href = 'login.html';
  }

  /**
   * Guard protected admin pages.
   * Waits for Firebase auth state to fully resolve before deciding to redirect.
   */
  async requireAuth() {
    if (window.location.pathname.endsWith('login.html')) return;

    // If session storage already has a valid demo session, allow immediately
    if (sessionStorage.getItem('tomea_admin_session')) return;

    // Wait for Firebase to resolve its auth state (avoids race condition)
    if (this._authStatePromise) {
      const user = await this._authStatePromise;
      if (!user && !sessionStorage.getItem('tomea_admin_session')) {
        console.warn('[TOMÉA] No active session. Redirecting to login.');
        window.location.href = 'login.html';
      }
    } else {
      if (!this.currentUser && !sessionStorage.getItem('tomea_admin_session')) {
        window.location.href = 'login.html';
      }
    }
  }

  isAuthenticated() {
    return !!this.currentUser || !!sessionStorage.getItem('tomea_admin_session');
  }
}

const Auth = new AuthService();

if (typeof window !== 'undefined') {
  window.Auth = Auth;
}
