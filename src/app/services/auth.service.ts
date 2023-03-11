import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, windowToggle } from 'rxjs';
import { LoginComponent } from '../login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private http:HttpClient,
    private toastr: ToastrService,
    private router:Router
  ) { }

  isLoggedIn=false;
  authenticatationState = new BehaviorSubject(false);
  userAgreementState = new BehaviorSubject(false);
  userid:any;
  userData:any;
  username:any;
  subjectname:any;
  authLoading:boolean=false;
  loginButtonText="";

  isAuthenticated(){
    return this.authenticatationState.value;
  }

  isaccepted(){
    return this.userAgreementState.value;
  }


  checkToken(){
    let token=localStorage.getItem('token');
    if(token){
      console.log("token added",token)
      this.authenticatationState.next(true);
      this.loadUser();
    }else{
      console.log("token not found");
      this.authenticatationState.next(false);
    }
  }

  async loadUser(){
    let token = localStorage.getItem('token');
    if(token){
      const httpOptions = {
        headers: new HttpHeaders({
          'x-access-token': token
      })
      }
      this.http.get('https://entrance.skduniversity.com/api/users/protect',httpOptions).subscribe(res=>{
      console.log(res);
      this.userData = res;
      this.authenticatationState.next(true);
      },err=>{
        console.log(err);
        this.logout();
        this.toastr.error(err.error.errormsg.message,'Error');
      });
    }

  }

  async loginService(logindata:any){
    console.log(logindata);
   
    let url=`https://entrance.skduniversity.com/api/v1/auth/authenticate`
   
      this.http.post(url,logindata).subscribe(res=>{
        console.log(res);
        let serverResoponse:any = res;

        if(serverResoponse.message === "Bad credentials"){
          this.toastr.error("UserID / Password seems to be incorrect!");
          // this.loginButtonText = "Login";
          console.log("bad credentials");
          //window.location.reload();
        }
        else if(serverResoponse.message==="You have already submitted your test!"){
          this.toastr.warning(serverResoponse.message);
          //window.location.reload();
        }
        else{
          console.log("loggged in")
          let token = serverResoponse.token;
          localStorage.setItem('token',token);
          this.authenticatationState.next(true);
          this.isLoggedIn=true;
          this.userid=serverResoponse.userID;
          this.username = serverResoponse.candidateName;
          localStorage.setItem('username',this.username);
          this.subjectname=serverResoponse.subject;
          localStorage.setItem('subjectname',this.subjectname);
          // this.loginButtonText = "Login";
          console.log(this.username,this.subjectname);
          localStorage.setItem('USERID',this.userid);
          this.toastr.success("successfully logged in",'Success');
          this.router.navigate(['/user-agrement']);
          
        }
      },err=>{
        console.log(err);

        this.toastr.error("Services are down!");
        // this.loginButtonText="Login";
       
      //   this.router.navigate(['']);
       
      // window.location.reload();
       
      })
  }

  logout(){
    console.log("user logged out");
    this.authenticatationState.next(false);
    this.userAgreementState.next(false);
    localStorage.removeItem('accepted-agreement');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('subjectname');
    this.isLoggedIn=false;
    this.username=null;
    this.subjectname=null;
    this.userData={};
    // this.toastr.success("Logged out",'Success');
    this.router.navigate(['/']);
    this.toastr.success("Logged out successfully!");
  }

  removesession(){
    console.log("user logged out");
    this.authenticatationState.next(false);
    this.userAgreementState.next(false);
    localStorage.removeItem('accepted-agreement');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('subjectname');
    this.isLoggedIn=false;
    this.username=null;
    this.subjectname=null;
    this.userData={};
  }





}
