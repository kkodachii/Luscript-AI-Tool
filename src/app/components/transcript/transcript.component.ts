import { Component, OnInit } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.css'], // Optional: Add styles if needed
  standalone: true,
  imports:[CommonModule]
})
export class TranscriptComponent implements OnInit {
  transcript: string = '';
  words: string[] = [];

  constructor(public transcriptionService: TranscriptionService) {}

  ngOnInit(): void {
    // Subscribe to the transcript observable
    this.transcriptionService.transcript$.subscribe((newTranscript) => {
      this.transcript = newTranscript;
      this.words = newTranscript.split(/\s+/);
    });
  }
}