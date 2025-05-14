import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpeedTestService, SpeedTestResult } from '../../services/speed-test.service';
import { AiAnalysisService, GamePerformance } from '../../services/ai-analysis.service';
import { LivePerformanceMeterComponent } from '../live-performance-meter/live-performance-meter.component';

@Component({
  selector: 'app-speed-test',
  standalone: true,
  imports: [CommonModule, FormsModule, LivePerformanceMeterComponent],
  templateUrl: './speed-test.component.html',
  styleUrls: ['./speed-test.component.css']
})
export class SpeedTestComponent implements OnInit {
  isTestRunning = false;
  testResults: SpeedTestResult | null = null;
  gamePerformance: GamePerformance[] = [];
  customQuery = '';
  customAnalysisResult = '';
  isAnalyzing = false;
  
  constructor(
    private speedTestService: SpeedTestService,
    private aiAnalysisService: AiAnalysisService
  ) {}
  
  ngOnInit(): void {
    this.speedTestService.isTestRunning$.subscribe(isRunning => {
      this.isTestRunning = isRunning;
    });
    
    this.speedTestService.testResults$.subscribe(results => {
      this.testResults = results;
      if (results) {
        this.gamePerformance = this.aiAnalysisService.getGamePerformanceEstimates(results);
      }
    });
  }
  
  runSpeedTest(): void {
    this.speedTestService.runSpeedTest().subscribe(results => {
      this.speedTestService.saveTestToHistory(results);
    });
  }
  
  analyzeCustom(): void {
    if (!this.customQuery.trim() || !this.testResults) {
      return;
    }
    
    this.isAnalyzing = true;
    this.customAnalysisResult = '';
    
    this.aiAnalysisService.getCustomAnalysis(this.customQuery, this.testResults)
      .subscribe(result => {
        this.customAnalysisResult = result;
        this.isAnalyzing = false;
      });
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
  
  getPerformanceClass(rating: string): string {
    return rating.toLowerCase();
  }
} 