import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SpeedTestResult } from './speed-test.service';

export interface GamePerformance {
  name: string;
  estimatedFps: number;
  requiredSpeed: number;
  performanceRating: 'poor' | 'average' | 'good' | 'excellent';
  iconUrl: string;
}

export interface AIAnalysisResult {
  games: GamePerformance[];
  customAnalysis?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAnalysisService {
  private apiKey = 'AIzaSyB-1HSfGwyghl3nne_MhV_QvfnrSHMxA6k';
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  private popularGames: GamePerformance[] = [
    { 
      name: 'Call of Duty: Warzone', 
      estimatedFps: 0, 
      requiredSpeed: 25, 
      performanceRating: 'average', 
      iconUrl: 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/nav/cod-mw-wz-logo-nav.png' 
    },
    { 
      name: 'Fortnite', 
      estimatedFps: 0, 
      requiredSpeed: 15, 
      performanceRating: 'average', 
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png' 
    },
    { 
      name: 'Apex Legends', 
      estimatedFps: 0, 
      requiredSpeed: 20, 
      performanceRating: 'average', 
      iconUrl: 'https://media.contentapi.ea.com/content/dam/apex-legends/images/2019/01/apex-featured-image-16x9.jpg.adapt.crop16x9.1023w.jpg' 
    },
    { 
      name: 'Overwatch 2', 
      estimatedFps: 0, 
      requiredSpeed: 20, 
      performanceRating: 'average', 
      iconUrl: 'https://blz-contentstack-images.akamaized.net/v3/assets/blt9c12f249ac15c7ec/bltbcf2689c29fa39eb/622906a991f4232f0085d3cc/Masthead_Overwatch2_Logo.png' 
    },
    { 
      name: 'Minecraft', 
      estimatedFps: 0, 
      requiredSpeed: 5, 
      performanceRating: 'average', 
      iconUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_The-Wild-Update_1170x500.jpg' 
    },
    { 
      name: 'League of Legends', 
      estimatedFps: 0, 
      requiredSpeed: 10, 
      performanceRating: 'average', 
      iconUrl: 'https://www.leagueoflegends.com/static/logo-1200-589b3ef693ce8a750fa4b4704f1e61f2.png' 
    },
    { 
      name: 'Counter-Strike 2', 
      estimatedFps: 0, 
      requiredSpeed: 15, 
      performanceRating: 'average', 
      iconUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg' 
    },
    { 
      name: 'Dota 2', 
      estimatedFps: 0, 
      requiredSpeed: 10, 
      performanceRating: 'average', 
      iconUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota2_social.jpg' 
    },
    { 
      name: 'GTA Online', 
      estimatedFps: 0, 
      requiredSpeed: 20, 
      performanceRating: 'average', 
      iconUrl: 'https://media-rockstargames-com.akamaized.net/rockstargames-newsite/img/global/games/fob/1280/GTAOnline.jpg' 
    },
    { 
      name: 'Valorant', 
      estimatedFps: 0, 
      requiredSpeed: 15, 
      performanceRating: 'average', 
      iconUrl: 'https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/blt3f072336e3f3ade4/63096d7be4a8c30e088e7720/Valorant_2022_E5A2_PlayVALORANT_ContentStackThumbnail_1200x625_MB01.png' 
    }
  ];

  constructor(private http: HttpClient) {}
  
  public getGamePerformanceEstimates(speedResult: SpeedTestResult): GamePerformance[] {
    return this.popularGames.map(game => {
      const { downloadSpeed, uploadSpeed, ping } = speedResult;
      
      // Calculate estimated FPS based on internet metrics and game requirements
      // Base FPS determined by game requirements
      let baseFps = game.requiredSpeed < 25 ? 120 : 
                    game.requiredSpeed < 50 ? 90 : 60;
      
      // Apply network quality factors
      const latencyFactor = this.calculateLatencyFactor(ping, game.name);
      const bandwidthFactor = this.calculateBandwidthFactor(downloadSpeed, game.requiredSpeed);
      const stabilityFactor = this.calculateStabilityFactor(downloadSpeed, uploadSpeed);
      
      // Calculate final estimated FPS
      const estimatedFps = Math.round(baseFps * latencyFactor * bandwidthFactor * stabilityFactor);
      
      // Determine performance rating
      let performanceRating: 'poor' | 'average' | 'good' | 'excellent';
      if (estimatedFps < 30) {
        performanceRating = 'poor';
      } else if (estimatedFps < 60) {
        performanceRating = 'average';
      } else if (estimatedFps < 100) {
        performanceRating = 'good';
      } else {
        performanceRating = 'excellent';
      }
      
      return {
        ...game,
        estimatedFps,
        performanceRating
      };
    });
  }
  
  public getCustomAnalysis(query: string, speedResult: SpeedTestResult): Observable<string> {
    const prompt = `
      Analyze if the following internet connection is suitable for ${query}:
      - Download speed: ${speedResult.downloadSpeed.toFixed(2)} Mbps
      - Upload speed: ${speedResult.uploadSpeed.toFixed(2)} Mbps
      - Ping: ${speedResult.ping.toFixed(2)} ms
      
      Please provide a concise analysis (maximum 3 sentences) about whether this connection is good enough for ${query}.
      Focus on practical advice about performance expectations.
    `;
    
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
    
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    return this.http.post<any>(url, requestBody).pipe(
      map(response => {
        if (response.candidates && response.candidates[0] && response.candidates[0].content) {
          return response.candidates[0].content.parts[0].text;
        }
        return `Unable to analyze performance for "${query}" at this time.`;
      }),
      catchError(error => {
        console.error('AI Analysis API error:', error);
        return of(`Unable to analyze performance for "${query}" at this time.`);
      })
    );
  }

  // Calculate impact of latency (ping) on gameplay for specific games
  private calculateLatencyFactor(ping: number, gameName: string): number {
    // Some games are more sensitive to latency than others
    let sensitivityFactor = 1.0;
    
    // Adjust sensitivity based on game type
    if (gameName.includes('Shooter') || gameName.includes('FPS') || 
        gameName.includes('Warzone') || gameName.includes('Apex')) {
      sensitivityFactor = 1.2; // FPS games are more sensitive to ping
    } else if (gameName.includes('Strategy') || gameName.includes('Minecraft')) {
      sensitivityFactor = 0.8; // Strategy games are less sensitive to ping
    }
    
    // Calculate base latency factor
    let baseFactor = ping < 20 ? 1.0 : 
                    ping > 200 ? 0.5 : 
                    1.0 - (0.5 * (ping - 20) / 180);
    
    // Apply game-specific sensitivity (capped between 0.5 and 1.0)
    return Math.max(0.5, Math.min(1.0, baseFactor * sensitivityFactor));
  }

  // Calculate impact of bandwidth on gameplay for specific games
  private calculateBandwidthFactor(downloadSpeed: number, requiredSpeed: number): number {
    // Bandwidth factor depends on the ratio of available bandwidth to required bandwidth
    const ratio = downloadSpeed / requiredSpeed;
    
    if (ratio >= 2.0) return 1.0; // More than double the required speed
    if (ratio <= 0.5) return 0.6; // Less than half the required speed
    
    // Linear scale between 0.5 and 2.0 ratio
    return 0.6 + (0.4 * (ratio - 0.5) / 1.5);
  }

  // Calculate stability factor based on upload/download balance
  private calculateStabilityFactor(downloadSpeed: number, uploadSpeed: number): number {
    // Ratio of upload to download speed indicates connection stability
    const ratio = uploadSpeed / downloadSpeed;
    
    if (ratio >= 0.25) return 1.0; // Ideal ratio
    if (ratio <= 0.05) return 0.8; // Poor balance
    
    // Linear scale between 0.05 and 0.25 ratio
    return 0.8 + (0.2 * (ratio - 0.05) / 0.2);
  }
} 