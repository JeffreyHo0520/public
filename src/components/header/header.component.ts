
import { Component, ChangeDetectionStrategy, signal, OnDestroy, input, output, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartIconComponent } from '../icons/start-icon.component';
import { StopIconComponent } from '../icons/stop-icon.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, StartIconComponent, StopIconComponent],
})
export class HeaderComponent implements OnDestroy {
  isSessionActive = input.required<boolean>();
  sessionToggle = output<boolean>();
  subjectChange = output<string>();

  currentTime = signal('');
  selectedSubject = signal('');
  private timerId: any;

  subjects = ['國文', '英文', '數學', '物理', '化學', '生物', '地理', '歷史', '公民'];

  constructor(private cdr: ChangeDetectorRef) {
    this.updateTime();
    this.timerId = setInterval(() => this.updateTime(), 1000);

    effect(() => {
        if (!this.isSessionActive() && this.selectedSubject() === '') {
            this.selectedSubject.set(this.subjects[0]);
            this.subjectChange.emit(this.subjects[0]);
        }
    });
  }

  updateTime() {
    this.currentTime.set(new Date().toLocaleTimeString('zh-TW'));
  }

  onSubjectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSubject.set(target.value);
    this.subjectChange.emit(target.value);
  }

  toggleSession() {
    if (this.isSessionActive()) {
      this.sessionToggle.emit(false);
    } else {
      this.sessionToggle.emit(true);
    }
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }
}
