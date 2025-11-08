import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../user-profile/user-profile';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    UserProfileComponent
  ],
  templateUrl: './header.html'
})
export class HeaderComponent {
  private authService = inject(AuthService);

  user = this.authService.user;
}
