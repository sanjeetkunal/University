import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

//components and pages
import { LoginComponent } from './login/login.component';
import { UserAgrementComponent } from './Pages/user-agrement/user-agrement.component';
import { QuizComponent } from './Pages/quiz/quiz.component';
import { QuizfinishComponent } from './Pages/quizfinish/quizfinish.component'


//external modules
import { MatMenuModule } from '@angular/material/menu'
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatCardModule} from '@angular/material/card'


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserAgrementComponent,
    QuizComponent,
    QuizfinishComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    NgbModule,
    FormsModule,
    ToastrModule.forRoot(), 
    HttpClientModule,
    MatRadioModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
