import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private isRegistered = false;

  registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = environment.production
          ? '/service-worker.js'
          : '/service-worker.js';

        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('✅ ServiceWorker успешно зарегистрирован:', registration);
            this.isRegistered = true;

            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('🔄 Доступна новая версия приложения');
                      this.showUpdateNotification();
                    } else {
                      console.log('✅ Приложение готово к работе оффлайн');
                    }
                  }
                };
              }
            };
          })
          .catch(error => {
            console.error('❌ Ошибка регистрации ServiceWorker:', error);
          });
      });
    }
  }

  unregisterServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister().then(() => {
          console.log('✅ ServiceWorker отменён');
          this.isRegistered = false;
        });
      });
    }
  }

  private showUpdateNotification(): void {
    if (confirm('Доступна новая версия приложения. Обновить?')) {
      window.location.reload();
    }
  }

  getRegistrationStatus(): boolean {
    return this.isRegistered;
  }
}
