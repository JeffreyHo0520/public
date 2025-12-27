
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationService, TeachingState, TeachingAction } from '../../services/observation.service';

function formatSeconds(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class DashboardComponent {
  observationService = inject(ObservationService);
  
  teachingStates = this.observationService.teachingStates;
  teachingActions = this.observationService.teachingActions;
  log = this.observationService.log;

  private longPressTimer: any;
  private isPressing = false;
  
  formatTime(seconds: number): string {
    return formatSeconds(seconds);
  }

  onStateClick(stateId: string) {
    this.observationService.toggleTeachingState(stateId);
  }

  onActionMouseDown(actionId: string) {
    this.isPressing = true;
    this.longPressTimer = setTimeout(() => {
      if (this.isPressing) {
        this.observationService.logTeachingAction(actionId, true);
      }
    }, 500);
  }

  onActionMouseUp(actionId: string) {
    clearTimeout(this.longPressTimer);
    if (this.isPressing) {
       // if it wasn't a long press, it was a short click
       // We can find out by checking if timer is active
       const action = this.teachingActions().find(a => a.id === actionId);
       if (action && !action.isTiming) {
         this.observationService.logTeachingAction(actionId, false);
       }
    }
    this.isPressing = false;
  }
}
