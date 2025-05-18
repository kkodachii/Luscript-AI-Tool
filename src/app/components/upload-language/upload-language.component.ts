import { Component, ViewChild, ElementRef } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-language',
  templateUrl: './upload-language.component.html',
  styleUrls: ['./upload-language.component.css'],
  standalone: true,
  providers: [GeminiService],
  imports:[CommonModule]
})
export class UploadLanguageComponent {
  selectedFile: File | null = null; // Stores the uploaded file
  selectedLanguage: string = 'auto-AI'; // Default language
  isLoading: boolean = false;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  audioUrl: string = '';
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  constructor(private geminiService: GeminiService, private transcriptionService: TranscriptionService) {}

  selectLanguage(language: string): void {
    this.selectedLanguage = language;
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Programmatically trigger the file input
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.audioUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.audioUrl = '';
    }
  }

  togglePlay(): void {
    if (this.audioPlayer) {
      if (this.isPlaying) {
        this.audioPlayer.nativeElement.pause();
      } else {
        this.audioPlayer.nativeElement.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

  onTimeUpdate(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.currentTime = audio.currentTime;
    this.transcriptionService.updateCurrentTime(this.currentTime);
  }

  onLoadedMetadata(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.duration = audio.duration;
    this.transcriptionService.setAudioDuration(audio.duration);
  }

  seekAudio(event: MouseEvent): void {
    if (!this.audioPlayer) return;
    
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = this.duration * percentage;
    
    this.audioPlayer.nativeElement.currentTime = newTime;
    this.currentTime = newTime;
    this.transcriptionService.updateCurrentTime(newTime);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  transcribe(): void {
    if (!this.selectedFile) {
      alert('Please select an audio or video file.');
      return;
    }

    this.isLoading = true;
    this.geminiService.transcribeLongAudio(this.selectedFile, this.selectedLanguage)
      .then(transcript => {
        this.transcriptionService.updateTranscript(transcript);
        this.isLoading = false;
      })
      .catch(err => {
        console.error('Error during transcription:', err);
        this.transcriptionService.updateTranscript('Transcription failed. Please try again.');
        this.isLoading = false;
      });
  }

  onButtonClick(): void {
    if (this.selectedFile) {
      // If a file is selected, start transcription
      this.transcribe();
    } else {
      // Otherwise, trigger file input
      this.triggerFileInput();
    }
  }

  deleteFile(): void {
    this.selectedFile = null;
    this.audioUrl = '';
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    
    // Reset the file input's value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the file input
    }
  }
}