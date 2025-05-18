import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { UploadLanguageComponent } from './components/upload-language/upload-language.component';
import { TranscriptComponent } from './components/transcript/transcript.component';
import { TranscriptionProgressComponent } from './components/transcription-progress/transcription-progress.component';
import { TranscriptionService } from './services/transcription.service';
import { PatchNoteComponent } from './components/patch-note/patch-note.component';

interface TranscriptionProgress {
  isProcessing: boolean;
  progress: number;
  currentChunk: number;
  totalChunks: number;
  statusMessage: string;
  isUploading: boolean;
  uploadProgress: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    UploadLanguageComponent,
    TranscriptComponent,
    TranscriptionProgressComponent,
    PatchNoteComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isMobileMenuOpen = false;
  showProgressModal = false;
  progress = 0;
  currentChunk = 0;
  totalChunks = 0;
  statusMessage = 'Processing audio...';
  isUploading = false;
  uploadProgress = 0;

  constructor(private transcriptionService: TranscriptionService) {
    // Subscribe to transcription progress updates
    this.transcriptionService.transcriptionProgress$.subscribe((progress: TranscriptionProgress) => {
      this.progress = progress.progress;
      this.currentChunk = progress.currentChunk;
      this.totalChunks = progress.totalChunks;
      this.statusMessage = progress.statusMessage;
      this.showProgressModal = progress.isProcessing;
      this.isUploading = progress.isUploading;
      this.uploadProgress = progress.uploadProgress;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    }
  }
}