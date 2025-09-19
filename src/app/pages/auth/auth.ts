import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRegistration, UserLogin } from '../../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  isLoginMode = true;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['']
    });

    // Add confirm password validator when in sign up mode
    this.updateFormValidation();
  }

  private updateFormValidation(): void {
    const confirmPasswordControl = this.authForm.get('confirmPassword');
    
    if (!this.isLoginMode) {
      confirmPasswordControl?.setValidators([
        Validators.required,
        this.passwordMatchValidator.bind(this)
      ]);
    } else {
      confirmPasswordControl?.clearValidators();
    }
    
    confirmPasswordControl?.updateValueAndValidity();
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = this.authForm?.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSwitchMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.clearMessages();
    this.authForm.reset();
    this.updateFormValidation();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    const formData = this.authForm.value;
    
    if (this.isLoginMode) {
      this.login(formData.email, formData.password);
    } else {
      this.signUp(formData.email, formData.password);
    }
  }

  private login(email: string, password: string): void {
    const credentials: UserLogin = { email, password };
    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.successMessage = 'Login successful! Redirecting...';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.message || 'Login failed. Please check your credentials.';
        this.isLoading = false;
      }
    });
  }

  private signUp(email: string, password: string): void {
    const registration: UserRegistration = {
      email,
      password,
      displayName: email.split('@')[0], // You may want to add a displayName field to your form
      role: 'student' // Default role, or add a role selector to your form
    };
    this.authService.signup(registration).subscribe({
      next: (result) => {
        this.successMessage = result.message || 'Account created successfully! Please check your email to verify your account.';
        this.isLoading = false;
        setTimeout(() => {
          this.isLoginMode = true;
          this.authForm.reset();
          this.clearMessages();
        }, 2000);
      },
      error: (err) => {
        this.error = err.message || 'Sign up failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onForgotPassword(): void {
    const email = this.authForm.get('email')?.value;
    if (!email) {
      this.error = 'Please enter your email address first.';
      return;
    }
    this.isLoading = true;
    this.clearMessages();
    this.authService.resetPassword(email).subscribe({
      next: (result) => {
        this.successMessage = result.message || 'Password reset link sent to your email!';
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to send password reset link.';
        this.isLoading = false;
      }
    });
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      this.authForm.get(key)?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.authForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required.`;
    }
    
    if (field?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    
    if (field?.hasError('minlength')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (field?.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
    }
    
    return '';
  }
}