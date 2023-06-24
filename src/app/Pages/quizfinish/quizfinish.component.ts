import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';



@Component({
  selector: 'app-quizfinish',
  templateUrl: './quizfinish.component.html',
  styleUrls: ['./quizfinish.component.scss']
})
export class QuizfinishComponent {
  constructor(private router: Router) {}
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

  CheatingAttempted: boolean = false;
  SuccessMessage: String = "Congratulations";
  // Message1:String="Well Done!";
  // Message2:String="Your test has been submitted successfully.";
  // Message3:String="You will be notified for your result by university examination authority, through email.";
  ngOnInit() {
    this.checkUserCheatingAttempted();
  }

  checkUserCheatingAttempted() {
    let cheatingattempted = localStorage.getItem("cheatingattempted");
    if (cheatingattempted != null && cheatingattempted != undefined) {
      if (cheatingattempted == "true") {
        this.SuccessMessage = "Cheating Attempted";
        this.CheatingAttempted = true;
      }
    }
  }

  // backToLogin() { this.router.navigate(['/']); }
}


