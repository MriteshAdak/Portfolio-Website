import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

type SessionResponse = {
  authenticated?: boolean;
};

async function hasActiveSession(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as SessionResponse;
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export const adminAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await hasActiveSession()) ? true : router.createUrlTree(['/admin/login']);
};

export const adminGuestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await hasActiveSession()) ? router.createUrlTree(['/admin']) : true;
};