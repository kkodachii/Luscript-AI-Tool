import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { UploadLanguageComponent } from './components/upload-language/upload-language.component';
import { TranscriptComponent } from './components/transcript/transcript.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, UploadLanguageComponent, TranscriptComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    }
  }
}