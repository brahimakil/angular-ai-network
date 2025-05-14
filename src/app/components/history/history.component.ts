import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeedTestService, SpeedTestResult } from '../../services/speed-test.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  testHistory: SpeedTestResult[] = [];
  
  constructor(private speedTestService: SpeedTestService) {}
  
  ngOnInit(): void {
    this.loadHistory();
  }
  
  loadHistory(): void {
    this.testHistory = this.speedTestService.getSavedTests();
  }
  
  clearHistory(): void {
    if (confirm('Are you sure you want to clear your test history?')) {
      localStorage.removeItem('speedTestHistory');
      this.testHistory = [];
    }
  }
  
  getSpeedClass(value: number, type: 'download' | 'upload' | 'ping'): string {
    if (type === 'ping') {
      if (value < 20) return 'excellent';
      if (value < 50) return 'good';
      if (value < 100) return 'average';
      return 'poor';
    } else {
      // For download/upload speeds
      if (value > 100) return 'excellent';
      if (value > 50) return 'good';
      if (value > 20) return 'average';
      return 'poor';
    }
  }
} 