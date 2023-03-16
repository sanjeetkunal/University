import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, windowToggle } from 'rxjs';
import { LoginComponent } from '../login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) { }

  isLoggedIn = false;
  authenticatationState = new BehaviorSubject(false);
  userAgreementState = new BehaviorSubject(false);
  userid: any;
  userData: any;
  username: any;
  subjectname: any;
  authLoading: boolean = false;
  loginButtonText = "";

  isAuthenticated() {
    return this.authenticatationState.value;
  }

  isaccepted() {
    return this.userAgreementState.value;
  }

  checkToken() {
    let token = localStorage.getItem('token');
    if (token) {
      this.authenticatationState.next(true);
      this.loadUser();
    } else {
      this.authenticatationState.next(false);
    }
  }

  async loadUser() {
    let token = localStorage.getItem('token');
    if (token) {
      const httpOptions = {
        headers: new HttpHeaders({
          'x-access-token': token
        })
      }
      this.http.get('https://entrance.skduniversity.com/api/users/protect', httpOptions).subscribe(res => {
        this.userData = res;
        this.authenticatationState.next(true);
      }, err => {
        this.logout();
        this.toastr.error(err.error.errormsg.message, 'Error');
      });
    }

  }

  async loginService(logindata: any) {
    let url = `https://entrance.skduniversity.com/api/v1/auth/authenticate`
    this.http.post(url, logindata).subscribe(res => {
      let serverResoponse: any = res;
      if (serverResoponse.token === null) { this.toastr.error(serverResoponse.message); }
      else if (serverResoponse.token !== null) {
        this.authenticatationState.next(true);
        this.isLoggedIn = true;
        localStorage.setItem('token', serverResoponse.token);
        localStorage.setItem('username', serverResoponse.candidateName);
        localStorage.setItem('subjectname', serverResoponse.subject);
        localStorage.setItem('userid', serverResoponse.userID);
        this.toastr.success("Logged in successfully", 'Success');
        this.router.navigate(['/user-agrement']);
      }
      else { this.toastr.error(serverResoponse.message); }
    }, err => {
      this.toastr.error("Services are down, please contact to administrator.");
    })
  }

  logout() {
    this.removesession();
    this.router.navigate(['/']);
    this.toastr.success("Logged out successfully!");
  }

  removesession() {
    this.authenticatationState.next(false);
    this.userAgreementState.next(false);
    localStorage.removeItem('userid');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user-accepted');
    localStorage.removeItem('subjectname');
    localStorage.removeItem('minuts');
      localStorage.removeItem('seconds');
      localStorage.removeItem("FiveQuestionSet");
    this.isLoggedIn = false;
    this.username = null;
    this.subjectname = null;
    this.userData = {};
  }
}
