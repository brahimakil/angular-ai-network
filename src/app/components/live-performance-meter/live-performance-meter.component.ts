import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeedTestResult } from '../../services/speed-test.service';
import { ThemeService } from '../../themes/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-live-performance-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-performance-meter.component.html',
  styleUrls: ['./live-performance-meter.component.css']
})
export class LivePerformanceMeterComponent implements OnChanges {
  @Input() testResults: SpeedTestResult | null = null;
  @Input() isTestRunning = false;

  downloadGaugeValue = 0;
  uploadGaugeValue = 0;
  pingGaugeValue = 0;
  
  performanceStatus: 'excellent' | 'good' | 'average' | 'poor' = 'average';
  statusMessage = '';
  
  currentTheme$: Observable<'light' | 'dark'>;
  
  constructor(private themeService: ThemeService) {
    this.currentTheme$ = this.themeService.themeMode$;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testResults'] && this.testResults) {
      this.animateGauges();
      this.calculatePerformanceStatus();
      this.triggerAnimations();
    }
  }
  
  private animateGauges(): void {
    if (!this.testResults) return;
    
    // Reset values
    this.downloadGaugeValue = 0;
    this.uploadGaugeValue = 0;
    this.pingGaugeValue = 0;
    
    // Target values
    const targetDownload = Math.min(this.testResults.downloadSpeed, 200); // Cap at 200 for gauge
    const targetUpload = Math.min(this.testResults.uploadSpeed, 200);
    const targetPing = Math.min(this.testResults.ping, 200);
    
    // Animate download gauge
    this.animateValue('download', targetDownload);
    
    // Animate upload gauge with delay
    setTimeout(() => {
      this.animateValue('upload', targetUpload);
    }, 300);
    
    // Animate ping gauge with delay
    setTimeout(() => {
      this.animateValue('ping', targetPing);
    }, 600);
  }
  
  private animateValue(gauge: 'download' | 'upload' | 'ping', target: number): void {
    const duration = 1500; // milliseconds
    const steps = 60;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      current += increment;
      
      if (gauge === 'download') {
        this.downloadGaugeValue = Math.min(current, target);
      } else if (gauge === 'upload') {
        this.uploadGaugeValue = Math.min(current, target);
      } else {
        this.pingGaugeValue = Math.min(current, target);
      }
      
      if (step >= steps) {
        clearInterval(interval);
      }
    }, stepTime);
  }
  
  private calculatePerformanceStatus(): void {
    if (!this.testResults) return;
    
    const { downloadSpeed, uploadSpeed, ping } = this.testResults;
    
    // Simplified scoring based on all three metrics
    let score = 0;
    
    // Download contribution (0-40 points)
    if (downloadSpeed >= 100) score += 40;
    else if (downloadSpeed >= 50) score += 30;
    else if (downloadSpeed >= 25) score += 20;
    else if (downloadSpeed >= 10) score += 10;
    else score += 5;
    
    // Upload contribution (0-30 points)
    if (uploadSpeed >= 50) score += 30;
    else if (uploadSpeed >= 25) score += 22;
    else if (uploadSpeed >= 10) score += 15;
    else if (uploadSpeed >= 5) score += 8;
    else score += 4;
    
    // Ping contribution (0-30 points) - lower is better
    if (ping < 20) score += 30;
    else if (ping < 40) score += 22;
    else if (ping < 80) score += 15;
    else if (ping < 150) score += 8;
    else score += 4;
    
    // Determine status and message
    if (score >= 85) {
      this.performanceStatus = 'excellent';
      this.statusMessage = '🚀 Excellent for gaming and streaming!';
    } else if (score >= 65) {
      this.performanceStatus = 'good';
      this.statusMessage = '✨ Great for most online activities!';
    } else if (score >= 40) {
      this.performanceStatus = 'average';
      this.statusMessage = '⚠️ Okay for casual use, but not ideal for pro gaming.';
    } else {
      this.performanceStatus = 'poor';
      this.statusMessage = '🛑 Needs improvement for advanced tasks.';
    }
  }
  
  private triggerAnimations(): void {
    // All animations are now disabled - this method exists but does nothing
    // We're keeping it for future expandability and to avoid changing the component structure
  }
  
  getSpeedRangeClass(type: 'download' | 'upload' | 'ping', value: number): string {
    if (type === 'ping') {
      // For ping, lower is better
      if (value < 20) return 'excellent';
      if (value < 50) return 'good';
      if (value < 100) return 'average';
      return 'poor';
    } else {
      // For download/upload
      if (value > 100) return 'excellent';
      if (value > 50) return 'good';
      if (value > 20) return 'average';
      return 'poor';
    }
  }
  
  getGaugeRotation(value: number, max: number = 200): string {
    // Calculate rotation angle (0 to 180 degrees)
    const percent = Math.min(value / max, 1);
    const angle = percent * 180;
    return `rotate(${angle}deg)`;
  }
  
  getPingHeight(value: number): string {
    // For ping, lower is better, so invert the percentage
    const normalizedValue = Math.min(value, 200);
    const invertedPercent = (1 - normalizedValue / 200) * 100;
    return `${invertedPercent}%`;
  }
  
  getFpsEstimate(): number {
    if (!this.testResults) return 0;
    
    const { downloadSpeed, uploadSpeed, ping } = this.testResults;
    
    // Professional FPS calculation based on internet metrics
    // Base FPS depends on modern hardware capabilities
    let baseFps = 144; // Modern gaming standard
    
    // Network quality factors
    const latencyFactor = this.calculateLatencyFactor(ping);
    const bandwidthFactor = this.calculateBandwidthFactor(downloadSpeed);
    const stabilityFactor = this.calculateStabilityFactor(downloadSpeed, uploadSpeed);
    
    // Apply network quality factors to base FPS
    const estimatedFps = Math.round(baseFps * latencyFactor * bandwidthFactor * stabilityFactor);
    
    // Ensure FPS is within realistic bounds
    return Math.max(30, Math.min(240, estimatedFps));
  }
  
  // Calculate impact of latency (ping) on gameplay
  private calculateLatencyFactor(ping: number): number {
    // Lower ping means better performance
    // Under 20ms: No impact (1.0)
    // 200ms+: Major impact (0.5)
    if (ping < 20) return 1.0;
    if (ping > 200) return 0.5;
    
    // Linear degradation between 20ms and 200ms
    return 1.0 - (0.5 * (ping - 20) / 180);
  }
  
  // Calculate impact of bandwidth (download speed) on gameplay
  private calculateBandwidthFactor(downloadSpeed: number): number {
    // Higher download speed means better performance
    // 100+ Mbps: Optimal (1.0)
    // Under 10 Mbps: Major impact (0.7)
    if (downloadSpeed >= 100) return 1.0;
    if (downloadSpeed <= 10) return 0.7;
    
    // Logarithmic improvement between 10 and 100 Mbps
    return 0.7 + (0.3 * Math.log10(downloadSpeed / 10) / Math.log10(10));
  }
  
  // Calculate the balance between upload and download speeds as stability factor
  private calculateStabilityFactor(downloadSpeed: number, uploadSpeed: number): number {
    // Ratio of upload to download speed indicates connection stability
    // Healthy ratio is at least 1:4 (upload:download)
    const ratio = uploadSpeed / downloadSpeed;
    
    if (ratio >= 0.25) return 1.0; // Ideal ratio
    if (ratio <= 0.05) return 0.8; // Poor balance
    
    // Linear scale between 0.05 and 0.25 ratio
    return 0.8 + (0.2 * (ratio - 0.05) / 0.2);
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  refreshAnalysis(): void {
    // Create a simple change object that matches SimpleChanges structure
    const change = {
      testResults: {
        previousValue: null,
        currentValue: this.testResults,
        firstChange: false,
        isFirstChange: () => false
      }
    };
    
    this.ngOnChanges(change);
  }
} 