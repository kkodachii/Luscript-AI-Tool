import { Component } from '@angular/core';
import { TranscribeAudioComponent } from './transcribe-audio/transcribe-audio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranscribeAudioComponent], // Import the standalone component
  template: `
    <h1>Welcome to the Audio Transcription App</h1>
    <app-transcribe-audio></app-transcribe-audio>
  `,
  styles: [],
})
export class AppComponent {}