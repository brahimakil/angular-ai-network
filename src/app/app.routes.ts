import { Routes } from '@angular/router';
import { SpeedTestComponent } from './components/speed-test/speed-test.component';
import { HistoryComponent } from './components/history/history.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SpeedTestComponent },
      { path: 'history', component: HistoryComponent }
    ]
  }
];
