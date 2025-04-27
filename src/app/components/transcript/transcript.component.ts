import { Component, OnInit } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as FileSaver from 'file-saver';
import * as docx from 'docx';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { SplitByHighlightPipe } from '../../pipes/split-by-highlight.pipe';

// Initialize pdfMake with virtual file system for fonts
const pdfMakeInstance = pdfMake;
(pdfMakeInstance as any).vfs = (pdfFonts as any).vfs;

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.css'], // Optional: Add styles if needed
  standalone: true,
  imports:[CommonModule, MatSnackBarModule, SplitByHighlightPipe]
})
export class TranscriptComponent implements OnInit {
  transcript: string = '';
  words: string[] = [];
  showDownloadDropdown: boolean = false;
  highlightedText: {text: string, startIndex: number, endIndex: number} | null = null;

  constructor(
    public transcriptionService: TranscriptionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribe to the transcript observable
    this.transcriptionService.transcript$.subscribe((newTranscript) => {
      this.transcript = newTranscript;
      this.words = newTranscript.split(/\s+/);
    });

    // Subscribe to highlighted text changes
    this.transcriptionService.highlightedText$.subscribe(highlighted => {
      this.highlightedText = highlighted;
    });
  }

  toggleDownloadDropdown() {
    this.showDownloadDropdown = !this.showDownloadDropdown;
  }

  downloadAsText() {
    const blob = new Blob([this.transcript], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'transcript.txt');
  }

  async downloadAsDocx() {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun(this.transcript)
            ],
          }),
        ],
      }],
    });

    const buffer = await docx.Packer.toBlob(doc);
    FileSaver.saveAs(buffer, 'transcript.docx');
  }

  downloadAsPdf() {
    const docDefinition = {
      content: this.transcript
    };
    (pdfMakeInstance as any).createPdf(docDefinition).download('transcript.pdf');
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.transcript).then(() => {
      this.snackBar.open('Text copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['success-snackbar']
      });
    });
  }
}