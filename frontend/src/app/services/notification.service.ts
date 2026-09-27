import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string): void {
    this.addNotification('success', message);
  }

  showError(message: string): void {
    this.addNotification('error', message);
  }

  showInfo(message: string): void {
    this.addNotification('info', message);
  }

  private addNotification(type: 'success' | 'error' | 'info', message: string): void {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: ToastNotification = { id, type, message };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      this.removeNotification(id);
    }, 4000);
  }

  removeNotification(id: string): void {
    const filtered = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
  }
}
