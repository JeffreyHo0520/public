
import { Injectable, signal, computed, effect } from '@angular/core';

export interface TeachingState {
  id: string;
  name: string;
  isActive: boolean;
  elapsedSeconds: number;
}

export interface TeachingAction {
  id: string;
  name: string;
  count: number;
  isTiming: boolean;
  elapsedSeconds: number;
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'state' | 'action' | 'note' | 'engagement' | 'session';
}

export interface EngagementEntry {
  timestamp: Date;
  level: '高' | '中' | '低';
}

export interface NoteEntry {
    timestamp: Date;
    text: string;
}

const INITIAL_TEACHING_STATES: TeachingState[] = [
  { id: 'lecture', name: '講述教學', isActive: false, elapsedSeconds: 0 },
  { id: 'group', name: '小組討論', isActive: false, elapsedSeconds: 0 },
  { id: 'practice', name: '實作/演算', isActive: false, elapsedSeconds: 0 },
  { id: 'digital', name: '數位運用', isActive: false, elapsedSeconds: 0 },
];

const INITIAL_TEACHING_ACTIONS: TeachingAction[] = [
  { id: 'praise', name: '正向鼓勵', count: 0, isTiming: false, elapsedSeconds: 0 },
  { id: 'correct', name: '糾正規範', count: 0, isTiming: false, elapsedSeconds: 0 },
  { id: 'open_q', name: '開放提問', count: 0, isTiming: false, elapsedSeconds: 0 },
  { id: 'closed_q', name: '封閉提問', count: 0, isTiming: false, elapsedSeconds: 0 },
  { id: 'patrol', name: '巡視走動', count: 0, isTiming: false, elapsedSeconds: 0 },
];

@Injectable({ providedIn: 'root' })
export class ObservationService {
  isSessionActive = signal(false);
  sessionStartTime = signal<Date | null>(null);
  subject = signal('未選擇科目');
  
  elapsedTime = signal(0);
  elapsedTimeFormatted = computed(() => {
    const totalSeconds = this.elapsedTime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  });
  
  teachingStates = signal<TeachingState[]>(JSON.parse(JSON.stringify(INITIAL_TEACHING_STATES)));
  teachingActions = signal<TeachingAction[]>(JSON.parse(JSON.stringify(INITIAL_TEACHING_ACTIONS)));
  log = signal<LogEntry[]>([]);
  engagementLog = signal<EngagementEntry[]>([]);
  qualitativeNotesLog = signal<NoteEntry[]>([]);

  private timerInterval: any;

  constructor() {
    effect(() => {
      if (this.isSessionActive()) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });
  }
  
  private startTimer() {
    this.stopTimer(); // Ensure no multiple intervals
    this.timerInterval = setInterval(() => {
      this.elapsedTime.update(t => t + 1);
      
      this.teachingStates.update(states =>
        states.map(s => s.isActive ? { ...s, elapsedSeconds: s.elapsedSeconds + 1 } : s)
      );
      this.teachingActions.update(actions =>
        actions.map(a => a.isTiming ? { ...a, elapsedSeconds: a.elapsedSeconds + 1 } : a)
      );
    }, 1000);
  }
  
  private stopTimer() {
    clearInterval(this.timerInterval);
  }
  
  startSession() {
    this.resetState();
    const now = new Date();
    this.sessionStartTime.set(now);
    this.isSessionActive.set(true);
    this.addLog(`觀課開始 (科目: ${this.subject()})`, 'session');
  }

  stopSession() {
    this.isSessionActive.set(false);
    this.addLog('觀課結束', 'session');
  }

  setSubject(subject: string) {
    this.subject.set(subject);
  }

  toggleTeachingState(stateId: string) {
    this.teachingStates.update(states =>
      states.map(s => {
        if (s.id === stateId) {
          const wasActive = s.isActive;
          this.addLog(`教學模式: ${s.name} ${wasActive ? '停用' : '啟用'}`, 'state');
          return { ...s, isActive: !s.isActive };
        }
        return s;
      })
    );
  }

  logTeachingAction(actionId: string, isLongPress: boolean) {
    this.teachingActions.update(actions =>
      actions.map(a => {
        if (a.id === actionId) {
          if (isLongPress) {
            const wasTiming = a.isTiming;
            this.addLog(`教學行為: ${a.name} ${wasTiming ? '停止計時' : '開始計時'}`, 'action');
            return { ...a, isTiming: !a.isTiming };
          } else {
            this.addLog(`教學行為: ${a.name} (計次)`, 'action');
            return { ...a, count: a.count + 1 };
          }
        }
        return a;
      })
    );
  }

  logEngagement(level: '高' | '中' | '低') {
    const entry: EngagementEntry = { timestamp: new Date(), level };
    this.engagementLog.update(log => [entry, ...log]);
    this.addLog(`學生專注度: ${level}`, 'engagement');
  }

  addQualitativeNote(text: string) {
    const entry: NoteEntry = { timestamp: new Date(), text };
    this.qualitativeNotesLog.update(log => [entry, ...log]);
    this.addLog(`質性紀錄: "${text}"`, 'note');
  }

  private addLog(message: string, type: LogEntry['type']) {
    const newEntry: LogEntry = { timestamp: new Date(), message, type };
    this.log.update(currentLog => [newEntry, ...currentLog.slice(0, 49)]);
  }

  private resetState() {
    this.sessionStartTime.set(null);
    this.elapsedTime.set(0);
    this.teachingStates.set(JSON.parse(JSON.stringify(INITIAL_TEACHING_STATES)));
    this.teachingActions.set(JSON.parse(JSON.stringify(INITIAL_TEACHING_ACTIONS)));
    this.log.set([]);
    this.engagementLog.set([]);
    this.qualitativeNotesLog.set([]);
  }
}
