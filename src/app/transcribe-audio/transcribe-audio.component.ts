import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-transcribe-audio',
  templateUrl: './transcribe-audio.component.html',
  styleUrls: ['./transcribe-audio.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here for two-way binding
  providers: [GeminiService],
})
export class TranscribeAudioComponent {
  selectedFile: File | null = null;
  transcript: string = '';
  isLoading: boolean = false;
  selectedLanguage: string = 'auto-AI'; // Default language

  constructor(private geminiService: GeminiService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  transcribe(): void {
    if (!this.selectedFile) {
      alert('Please select an audio file.');
      return;
    }

    this.isLoading = true;
    this.geminiService.transcribeAudioInline(this.selectedFile, this.selectedLanguage).subscribe({
      next: (response: any) => {
        console.log('Full API Response:', response); // Log the full response

        // Adjust based on the actual response structure
        if (response && response.candidates && response.candidates.length > 0) {
          this.transcript = response.candidates[0].content.parts[0].text || 'No transcript available.';
        } else {
          this.transcript = 'No transcript available.';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error during transcription:', err);
        this.transcript = 'Transcription failed. Please try again.';
        this.isLoading = false;
      },
    });
  }
}