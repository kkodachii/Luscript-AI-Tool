import { Component, OnInit } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.css'], // Optional: Add styles if needed
  standalone: true,
  imports:[CommonModule, MatSnackBarModule, ]
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

  async downloadAsText() {
    const FileSaver = await import('file-saver');
    const blob = new Blob([this.transcript], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'transcript.txt');
  }

  async downloadAsDocx() {
    const docx = await import('docx');
    const FileSaver = await import('file-saver');
    
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

  async downloadAsPdf() {
    const pdfMake = await import('pdfmake/build/pdfmake');
    const pdfFonts = await import('pdfmake/build/vfs_fonts');
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
    
    const docDefinition = {
      content: this.transcript
    };
    (pdfMake as any).createPdf(docDefinition).download('transcript.pdf');
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