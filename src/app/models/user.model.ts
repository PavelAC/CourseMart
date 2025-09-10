// Interface for Firestore user data
export interface UserProfile {
  uid?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  enrolledCourses?: string[];
  createdCourses?: string[]; // For instructors
  bio?: string;
  website?: string;
}

// Class for authenticated user session management
export class AuthUser {
  constructor(
    public email: string,
    public uid: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    public displayName?: string,
    public role?: 'student' | 'instructor' | 'admin'
  ) {}

  get token(): string | null {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get isTokenExpired(): boolean {
    return !this._tokenExpirationDate || new Date() > this._tokenExpirationDate;
  }

  // Helper methods
  get isStudent(): boolean {
    return this.role === 'student';
  }

  get isInstructor(): boolean {
    return this.role === 'instructor';
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  // Refresh token data
  updateToken(token: string, expirationDate: Date): void {
    this._token = token;
    this._tokenExpirationDate = expirationDate;
  }
}

// Registration form interface
export interface UserRegistration {
  email: string;
  password: string;
  displayName: string;
  role: 'student' | 'instructor';
}

// Login form interface
export interface UserLogin {
  email: string;
  password: string;
}