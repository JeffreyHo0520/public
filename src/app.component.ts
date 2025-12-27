
import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationService, LogEntry, TeachingState, TeachingAction, EngagementEntry, NoteEntry } from './services/observation.service';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FooterComponent } from './components/footer/footer.component';
import { SummaryModalComponent } from './components/summary-modal/summary-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    DashboardComponent,
    FooterComponent,
    SummaryModalComponent,
  ],
})
export class AppComponent implements OnDestroy {
  observationService = inject(ObservationService);
  
  isSessionActive = this.observationService.isSessionActive;
  showSummaryModal = signal(false);
  flashFooter = signal(false);

  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  summaryData = computed(() => {
    return {
      subject: this.observationService.subject(),
      startTime: this.observationService.sessionStartTime(),
      endTime: new Date(),
      totalDuration: this.observationService.elapsedTimeFormatted(),
      states: this.observationService.teachingStates(),
      actions: this.observationService.teachingActions(),
      engagements: this.observationService.engagementLog(),
      notes: this.observationService.qualitativeNotesLog(),
      fullLog: this.observationService.log(),
    };
  });

  constructor() {
    this.resetInactivityTimer();
    effect(() => {
      if (this.isSessionActive()) {
        this.resetInactivityTimer();
      } else {
        clearTimeout(this.inactivityTimer);
        this.flashFooter.set(false);
      }
    });
  }

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  @HostListener('window:click')
  onUserActivity() {
    this.resetInactivityTimer();
  }

  resetInactivityTimer() {
    if (!this.isSessionActive()) return;
    this.flashFooter.set(false);
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.flashFooter.set(true);
    }, this.INACTIVITY_TIMEOUT);
  }

  toggleSession(start: boolean) {
    if (start) {
      this.observationService.startSession();
    } else {
      this.observationService.stopSession();
      this.showSummaryModal.set(true);
    }
  }

  handleSubjectChange(subject: string) {
    this.observationService.setSubject(subject);
  }

  onCloseModal() {
    this.showSummaryModal.set(false);
  }

  ngOnDestroy() {
    clearTimeout(this.inactivityTimer);
  }
}
