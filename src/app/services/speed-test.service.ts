import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SpeedTestResult {
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  ping: number; // in ms
  testDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SpeedTestService {
  private testResults = new BehaviorSubject<SpeedTestResult | null>(null);
  public testResults$ = this.testResults.asObservable();
  
  private isTestRunning = new BehaviorSubject<boolean>(false);
  public isTestRunning$ = this.isTestRunning.asObservable();
  
  constructor() {
    // Try to load previous results from localStorage
    const savedResults = localStorage.getItem('lastSpeedTest');
    if (savedResults) {
      const parsed = JSON.parse(savedResults);
      parsed.testDate = new Date(parsed.testDate);
      this.testResults.next(parsed);
    }
  }
  
  public runSpeedTest(): Observable<SpeedTestResult> {
    this.isTestRunning.next(true);
    
    // This is a simplified mock implementation
    // In a real app, you would use a library like navigator.connection or a dedicated API
    return new Observable<SpeedTestResult>(observer => {
      // Simulate network test with random values
      setTimeout(() => {
        const downloadSpeed = Math.random() * 100 + 20; // 20-120 Mbps
        
        setTimeout(() => {
          const uploadSpeed = downloadSpeed * 0.7 * (0.8 + Math.random() * 0.4); // Typically less than download
          
          setTimeout(() => {
            const ping = Math.random() * 30 + 10; // 10-40ms
            
            const result: SpeedTestResult = {
              downloadSpeed,
              uploadSpeed,
              ping,
              testDate: new Date()
            };
            
            // Save to localStorage
            localStorage.setItem('lastSpeedTest', JSON.stringify(result));
            
            // Update the BehaviorSubject with new results
            this.testResults.next(result);
            
            // Complete the observable
            observer.next(result);
            observer.complete();
            
            this.isTestRunning.next(false);
          }, 1000); // Ping test time
        }, 2000); // Upload test time
      }, 3000); // Download test time
    });
  }
  
  public getSavedTests(): SpeedTestResult[] {
    const saved = localStorage.getItem('speedTestHistory');
    if (saved) {
      const parsed = JSON.parse(saved) as SpeedTestResult[];
      return parsed.map(result => {
        return {
          ...result,
          testDate: new Date(result.testDate)
        };
      });
    }
    return [];
  }
  
  public saveTestToHistory(result: SpeedTestResult): void {
    const history = this.getSavedTests();
    history.unshift(result);
    // Keep only last 10 tests
    const trimmedHistory = history.slice(0, 10);
    localStorage.setItem('speedTestHistory', JSON.stringify(trimmedHistory));
  }
} 