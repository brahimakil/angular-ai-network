import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeMode = new BehaviorSubject<ThemeMode>('light');
  public themeMode$ = this.themeMode.asObservable();
  
  constructor() {
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.setTheme(savedTheme);
    }
  }
  
  public setTheme(mode: ThemeMode): void {
    document.body.setAttribute('data-theme', mode);
    localStorage.setItem('themeMode', mode);
    this.themeMode.next(mode);
  }
  
  public toggleTheme(): void {
    const currentTheme = this.themeMode.getValue();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
} 