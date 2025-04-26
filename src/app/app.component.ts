import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { UploadLanguageComponent } from './components/upload-language/upload-language.component';
import { TranscriptComponent } from './components/transcript/transcript.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, UploadLanguageComponent,TranscriptComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {}