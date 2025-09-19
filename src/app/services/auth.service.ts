import { Injectable, signal, computed, inject, effect } from "@angular/core";
import { 
  BehaviorSubject, 
  catchError, 
  from, 
  map, 
  Observable, 
  switchMap, 
  tap, 
  throwError,
  of,
  EMPTY,
  firstValueFrom
} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { db, app } from "../../environments/environments";
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
  reload,
  updateProfile
} from "firebase/auth";
import { 
  AuthUser, 
  UserProfile, 
  UserRegistration, 
  UserLogin 
} from "../models/user.model";
import { DatabaseService } from "../database/database.service";
import { Timestamp } from "firebase/firestore";

// AuthResult type for observable results
interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly databaseService = inject(DatabaseService);
  // Firebase Auth instance
  private readonly auth: Auth = getAuth(app);
  
  // No REST endpoints needed; using Firebase Auth SDK

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(null);
  public readonly user$ = this.userSubject.asObservable();

  // Signals
  public readonly currentUser = signal<AuthUser | null>(null);
  public readonly isAuthenticated = computed(() => !!this.currentUser()?.isAuthenticated);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  constructor() {
    // Keep signals in sync with BehaviorSubject
    effect(() => {
      this.currentUser.set(this.userSubject.value);
    });

    this.initializeAuthStateListener();
  }

  /**
   * Initialize Firebase Auth state listener
   */
  private initializeAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
      this.isLoading.set(true);
      try {
        if (firebaseUser) {
          const userProfile = await firstValueFrom(this.databaseService.getUserProfile(firebaseUser.uid));
          if (userProfile) {
            const token = await firebaseUser.getIdToken();
            const tokenResult = await firebaseUser.getIdTokenResult();
            const authUser = new AuthUser(
              firebaseUser.email!,
              firebaseUser.uid,
              token,
              new Date(tokenResult.expirationTime),
              userProfile.displayName,
              userProfile.role
            );
            this.userSubject.next(authUser);
            this.persistUserData(authUser);
          }
        } else {
          this.userSubject.next(null);
          this.clearStoredUserData();
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        this.error.set('Authentication error occurred');
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Clear stored user data
   */
  private clearStoredUserData(): void {
    localStorage.removeItem('userData');
  }

  /**
   * Register a new user with email verification
   */
  signup(registration: UserRegistration): Observable<AuthResult> {
    const validationErrors = this.validateRegistration(registration);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0] as string;
      return throwError(() => new Error(firstError));
    }

    this.isLoading.set(true);
    this.error.set(null);

    return from(createUserWithEmailAndPassword(this.auth, registration.email, registration.password)).pipe(
      switchMap(userCredential => {
        const user = userCredential.user;
        return from(updateProfile(user, { displayName: registration.displayName })).pipe(
          switchMap(() => {
            const userProfile: UserProfile = {
              uid: user.uid,
              email: registration.email,
              displayName: registration.displayName,
              role: registration.role,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              enrolledCourses: registration.role === 'student' ? [] : undefined,
              createdCourses: registration.role === 'instructor' ? [] : undefined
            };

            return this.databaseService.saveUserProfile(
              userProfile.uid ?? '',
              userProfile.email,
              userProfile.displayName,
              userProfile.role === 'student' || userProfile.role === 'instructor' ? userProfile.role : 'student'
            ).pipe(
              switchMap(() => from(sendEmailVerification(user)).pipe(
                tap({
                  next: () => {
                    console.log('Verification email sent successfully.');
                  },
                  error: (err) => {
                    console.error('Error sending verification email:', err);
                  }
                })
              )),
              map(() => ({
                success: true,
                message: 'Account created successfully. Please verify your email before logging in.'
              }))
            );
          })
        );
      }),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleFirebaseError(error);
      })
    );
  }

  /**
   * Login user with email and password
   */
  login(credentials: UserLogin): Observable<AuthUser> {
    const validationErrors = this.validateLogin(credentials);
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0] as string;
      return throwError(() => new Error(firstError));
    }

    this.isLoading.set(true);
    this.error.set(null);

    return from(signInWithEmailAndPassword(this.auth, credentials.email, credentials.password)).pipe(
      switchMap(userCredential => 
        from((async () => {
          const user = userCredential.user;
          await reload(user);

          if (!user.emailVerified) {
            await signOut(this.auth);
            throw new Error('EMAIL_NOT_VERIFIED');
          }

          const userProfile = await firstValueFrom(this.databaseService.getUserProfile(user.uid));
          if (!userProfile) {
            throw new Error('USER_PROFILE_NOT_FOUND');
          }

          const token = await user.getIdToken();
          const tokenResult = await user.getIdTokenResult();

          return new AuthUser(
            user.email!,
            user.uid,
            token,
            new Date(tokenResult.expirationTime),
            userProfile.displayName,
            userProfile.role
          );
        })())
      ),
      tap(() => this.isLoading.set(false)),
      catchError(error => {
        this.isLoading.set(false);
        return this.handleFirebaseError(error);
      })
    );
  }

  /**
   * Logout user and clean up
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.clearStoredUserData();
        this.router.navigate(['/auth']);
      }),
      catchError((error) => {
        console.error('Logout error:', error);
        this.userSubject.next(null);
        this.clearStoredUserData();
        this.router.navigate(['/auth']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Send email verification to current user
   */
  sendVerificationEmail(): Observable<AuthResult> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    return from(sendEmailVerification(currentUser)).pipe(
      map(() => ({
        success: true,
        message: 'Verification email sent successfully.'
      })),
      catchError(this.handleFirebaseError.bind(this))
    );
  }

  /**
   * Reset password
   */
  resetPassword(email: string): Observable<AuthResult> {
    if (!this.isValidEmail(email)) {
      return throwError(() => new Error('Invalid email format'));
    }
    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      map(() => ({
        success: true,
        message: 'Password reset email sent successfully.'
      })),
      catchError(this.handleFirebaseError.bind(this))
    );
  }

  /**
   * Update user password
   */
  updateUserPassword(newPassword: string): Observable<AuthResult> {
    if (!this.isValidPassword(newPassword)) {
      return throwError(() => new Error('Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, and one number'));
    }
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    return from(updatePassword(currentUser, newPassword)).pipe(
      map(() => ({
        success: true,
        message: 'Password updated successfully.'
      })),
      catchError(this.handleFirebaseError.bind(this))
    );
  }

  /**
   * Refresh current user's ID token
   */
  refreshToken(): Observable<string> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }
    return from(currentUser.getIdToken(true));
  }

  /**
   * Check if email is verified
   */
  private checkEmailVerification(idToken: string): Observable<boolean> {
    // This method is not used in the current Firebase Auth SDK flow. Remove it.
    return of(false); // Placeholder, not used
  }

  // Removed autoLogin logic; now handled by Firebase Auth state listener

  /**
   * Handle successful authentication
   */
  private handleAuthentication(user: AuthUser, refreshToken?: string): void {
    this.userSubject.next(user);
    this.persistUserData(user, refreshToken);
    this.error.set(null);
  }

  /**
   * Create AuthUser instance from API response and profile
   */
  // Removed createAuthUser and related obsolete logic

  // Removed setupAutoRefresh logic; now handled by Firebase Auth state listener

  /**
   * Clear token refresh timer
   */
  private clearTokenRefreshTimer(): void {
    // No token refresh timer needed with Firebase Auth SDK
  }

  /**
   * Persist user data to localStorage
   */
  private persistUserData(user: AuthUser, refreshToken?: string): void {
    const storedData = this.getStoredUserData();
    const userData = {
      email: user.email,
      uid: user.uid,
      token: user.token,
      tokenExpirationDate: user['_tokenExpirationDate'].toISOString(),
      displayName: user.displayName,
      role: user.role,
      refreshToken: refreshToken || storedData?.refreshToken
    };

    localStorage.setItem('userData', JSON.stringify(userData));
  }

  /**
   * Get stored user data from localStorage
   */
 private getStoredUserData(): any {
  const userDataStr = localStorage.getItem('userData');
  if (!userDataStr) {
    return null;
  }
  try {
    return JSON.parse(userDataStr);
  } catch {
    return null;
  }
}

/**
 * Get current user's roles and permissions
 */
  getCurrentUserRole(): Observable<'student' | 'instructor' | 'admin' | null> {
    return this.user$.pipe(map(user => user?.role || null));
  }

  hasRole(role: 'student' | 'instructor' | 'admin'): Observable<boolean> {
    return this.getCurrentUserRole().pipe(map(currentRole => currentRole === role));
  }

  get currentRole(): 'student' | 'instructor' | 'admin' | null {
    return this.currentUser()?.role ?? null;
  }

  private validateRegistration(registration: UserRegistration): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!this.isValidEmail(registration.email)) {
      errors.email = 'Invalid email format';
    }

    if (!this.isValidPassword(registration.password)) {
      errors.password = 'Password must be at least 8 characters long with at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!registration.displayName || registration.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters long';
    }

    return errors;
  }

  /**
   * Validate login credentials
   */
  private validateLogin(credentials: UserLogin): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!this.isValidEmail(credentials.email)) {
      errors.email = 'Invalid email format';
    }

    if (!credentials.password || credentials.password.length < 1) {
      errors.password = 'Password is required';
    }

    return errors;
  }

  /**
   * Email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Password validation
   */
  private isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Enhanced Firebase error handling
   */
  private handleFirebaseError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    console.error('Firebase Auth Error:', error);
    if (error.message) {
      switch (error.message) {
        case 'EMAIL_NOT_VERIFIED':
          errorMessage = 'Please verify your email address before logging in.';
          break;
        case 'USER_PROFILE_NOT_FOUND':
          errorMessage = 'User profile not found. Please contact support.';
          break;
        default:
          if (error.code) {
            errorMessage = this.getFirebaseErrorMessage(error.code);
          } else {
            errorMessage = error.message;
          }
      }
    } else if (error.code) {
      errorMessage = this.getFirebaseErrorMessage(error.code);
    }
    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get user-friendly error messages for Firebase error codes
   */
  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again.';
      case 'auth/invalid-action-code':
        return 'The verification code is invalid or has expired.';
      case 'auth/expired-action-code':
        return 'The verification code has expired. Please request a new one.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
  }
}
