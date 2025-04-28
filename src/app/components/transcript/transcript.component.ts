import { Component, OnInit, HostListener } from '@angular/core';
import { TranscriptionService } from '../../services/transcription.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html',
  styleUrls: ['./transcript.component.css'], // Optional: Add styles if needed
  standalone: true,
  imports:[CommonModule, MatSnackBarModule, ClickOutsideDirective]
})
export class TranscriptComponent implements OnInit {
  transcript: string = '';
  words: string[] = [];
  showDownloadDropdown: boolean = false;
  isMobile: boolean = false;
  dropdownPosition: { top: string; left: string } = { top: '0px', left: '0px' };
  highlightedText: {text: string, startIndex: number, endIndex: number} | null = null;

  constructor(
    public transcriptionService: TranscriptionService,
    private snackBar: MatSnackBar
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    this.checkIfMobile();
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

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 768; // 768px is a common breakpoint for mobile
  }

  toggleDownloadDropdown(event: MouseEvent) {
    event.stopPropagation();
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    if (this.isMobile) {
      // For mobile, position the dropdown in the center of the screen
      this.dropdownPosition = {
        top: '50%',
        left: '50%'
      };
    } else {
      // For desktop, position below the button
      this.dropdownPosition = {
        top: `${rect.bottom + window.scrollY}px`,
        left: `${rect.right - 192}px` // 192px is the width of the dropdown (w-48)
      };
    }
    
    this.showDownloadDropdown = !this.showDownloadDropdown;
  }

  closeDropdown() {
    this.showDownloadDropdown = false;
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
    try {
      // Import pdfMake and fonts
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      
      // Get the pdfMake instance
      const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
      
      // Set up virtual file system for fonts
      pdfMake.vfs = (pdfFontsModule as any).pdfMake?.vfs;
      
      const docDefinition = {
        content: [
          {
            text: 'Transcript',
            style: 'header'
          },
          {
            text: this.transcript,
            style: 'content'
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            marginBottom: 10
          },
          content: {
            fontSize: 12,
            lineHeight: 1.5
          }
        },
        defaultStyle: {
          font: 'Roboto'
        }
      };

      // Create and download PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.download('transcript.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.snackBar.open('Error generating PDF. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
    }
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