
import { Component, ChangeDetectionStrategy, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class FooterComponent {
  observationService = inject(ObservationService);
  
  isSessionActive = input.required<boolean>();
  flash = input.required<boolean>();
  activity = output<void>();

  noteText = signal('');
  selectedEngagement = signal<'高' | '中' | '低' | null>(null);

  setEngagement(level: '高' | '中' | '低') {
    if (!this.isSessionActive()) return;
    this.selectedEngagement.set(level);
    this.observationService.logEngagement(level);
    this.activity.emit();
    setTimeout(() => this.selectedEngagement.set(null), 1000); // Reset after a short delay
  }

  addNote() {
    if (!this.isSessionActive() || this.noteText().trim() === '') return;
    this.observationService.addQualitativeNote(this.noteText().trim());
    this.noteText.set('');
    this.activity.emit();
  }
}
