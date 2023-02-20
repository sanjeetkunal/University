import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { QuizComponent } from './Pages/quiz/quiz.component';
import { QuizfinishComponent } from './Pages/quizfinish/quizfinish.component';
import { UserAgrementComponent } from './Pages/user-agrement/user-agrement.component';

const routes: Routes = [
  {
    path:'',
    component: LoginComponent,
    pathMatch:'full'
  },

  {
path:'user-agrement',
component: UserAgrementComponent,

  },
  {
    path:'quiz',
    component: QuizComponent,
    
  },
  {
    path:'quizfinish',
    component: QuizfinishComponent,
        
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
