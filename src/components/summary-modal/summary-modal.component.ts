
import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

// Define the type for summaryData inline for simplicity in this single-file structure context
type SummaryDataType = {
  subject: string;
  startTime: Date | null;
  endTime: Date;
  totalDuration: string;
  states: { name: string; elapsedSeconds: number }[];
  actions: { name: string; count: number; elapsedSeconds: number }[];
  engagements: { timestamp: Date; level: string }[];
  notes: { timestamp: Date; text: string }[];
  fullLog: { timestamp: Date; message: string }[];
};


@Component({
  selector: 'app-summary-modal',
  templateUrl: './summary-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DatePipe],
})
export class SummaryModalComponent {
  summaryData = input.required<SummaryDataType>();
  closeModal = output<void>();

  copyStatus = signal<'idle' | 'copied'>('idle');

  formatSeconds(seconds: number): string {
    const totalSeconds = seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hours, minutes, secs]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }
  
  private generateReportText(): string {
    const data = this.summaryData();
    if (!data.startTime) return "無數據可匯出。";

    let report = `Chronos 觀課報告\n`;
    report += `========================================\n`;
    report += `科目: ${data.subject}\n`;
    report += `開始時間: ${data.startTime.toLocaleString('zh-TW')}\n`;
    report += `結束時間: ${data.endTime.toLocaleString('zh-TW')}\n`;
    report += `總時長: ${data.totalDuration}\n\n`;

    report += `教學模式統計\n`;
    report += `----------------------------------------\n`;
    data.states.forEach(s => {
      if (s.elapsedSeconds > 0) {
        report += `${s.name}: ${this.formatSeconds(s.elapsedSeconds)}\n`;
      }
    });
    report += `\n`;

    report += `教學行為統計\n`;
    report += `----------------------------------------\n`;
    data.actions.forEach(a => {
      if (a.count > 0 || a.elapsedSeconds > 0) {
        report += `${a.name}: 計次 ${a.count} 次, 計時 ${this.formatSeconds(a.elapsedSeconds)}\n`;
      }
    });
    report += `\n`;
    
    report += `質性紀錄\n`;
    report += `----------------------------------------\n`;
    data.notes.slice().reverse().forEach(n => {
        report += `[${n.timestamp.toLocaleTimeString('zh-TW')}] ${n.text}\n`;
    });
    report += `\n`;

    report += `完整事件紀錄流\n`;
    report += `----------------------------------------\n`;
    data.fullLog.slice().reverse().forEach(log => {
        report += `[${log.timestamp.toLocaleTimeString('zh-TW')}] ${log.message}\n`;
    });
    
    return report;
  }

  copyToClipboard() {
    const reportText = this.generateReportText();
    navigator.clipboard.writeText(reportText).then(() => {
      this.copyStatus.set('copied');
      setTimeout(() => this.copyStatus.set('idle'), 2000);
    }).catch(err => console.error('無法複製文字: ', err));
  }

  downloadTxt() {
    const reportText = this.generateReportText();
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
    const blob = new Blob([bom, reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chronos報告_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
