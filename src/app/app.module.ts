import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './core/layout/admin/admin.component';
import { ConfigurationComponent } from './core/layout/admin/configuration/configuration.component';
import { NavBarComponent } from './core/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './core/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavLogoComponent } from './core/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavRightComponent } from './core/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavCollapseComponent } from './core/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavContentComponent } from './core/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './core/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavItemComponent } from './core/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { NavigationItem } from './core/layout/admin/navigation/navigation';
import { NavigationComponent } from './core/layout/admin/navigation/navigation.component';
import { GuestComponent } from './core/layout/guest/guest.component';
import { SharedModule } from './shared/shared.module';

import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { VehicleNumberPipe } from './shared/pipes/vehicle-number/vehicle-number.pipe';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);

@NgModule({
    declarations: [
        AppComponent,
        AdminComponent,
        NavBarComponent,
        NavLeftComponent,
        NavRightComponent,
        NavigationComponent,
        NavLogoComponent,
        ConfigurationComponent,
        GuestComponent
    ],
    bootstrap: [AppComponent],
    exports: [VehicleNumberPipe], imports: [BrowserModule,
        AppRoutingModule,
        SharedModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        AngularFireAuthModule,
        VehicleNumberPipe,
        NavContentComponent,
        NavItemComponent,
        NavCollapseComponent,
        NavGroupComponent],
    providers: [
        NavigationItem,
        provideHttpClient(
            withInterceptors([authInterceptor, loadingInterceptor])
        )
    ]
})
export class AppModule { }
