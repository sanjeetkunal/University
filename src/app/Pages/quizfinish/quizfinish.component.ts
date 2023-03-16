import { Component } from '@angular/core';
import {  filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';



@Component({
  selector: 'app-quizfinish',
  templateUrl: './quizfinish.component.html',
  styleUrls: ['./quizfinish.component.scss']
})
export class QuizfinishComponent {
  
  // constructor(private router:Router){
  //   this.router.events
  //   .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
  //   .subscribe(event => {
  //     if (
  //       event.id === 1 &&
  //       event.url === event.urlAfterRedirects
  //     ) {

  //           console.log("page is refreshed in quizfinish")
        

          
  //     }
  //   })
  // }

}


