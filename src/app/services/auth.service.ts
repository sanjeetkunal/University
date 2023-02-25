import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http:HttpClient,
    private toastr: ToastrService,
    private router:Router
  ) { }

  isLoggedIn:boolean=false;
  authenticatationState = new BehaviorSubject(false);
  userAgreementState = new BehaviorSubject(false);
  userid:any;
  userData:any;
  username:any;
  subjectname:any;
  authLoading:boolean=false;

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
      this.http.get('http://localhost:8000/api/users/protect',httpOptions).subscribe(res=>{
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
    let url=`http://103.44.53.3:8080/api/v1/auth/authenticate`
   
      this.http.post(url,logindata).subscribe(res=>{
        console.log(res);
        let serverResoponse:any = res;
        if(serverResoponse.message === "Bad credentials"){
          this.toastr.error('Error',serverResoponse.message);
        }else{
          console.log("loggged in")
          let token = serverResoponse.token;
          localStorage.setItem('token',token);
          this.authenticatationState.next(true);
          this.isLoggedIn=true;
          this.userid=serverResoponse.userID;
          this.username = serverResoponse.candidateName;
          this.subjectname=serverResoponse.subject;
          console.log(this.username,this.subjectname);
          localStorage.setItem('USERID',this.userid);
          this.toastr.success("successfully logged in",'Success');
          this.router.navigate(['/user-agrement']);
          
        }
      },err=>{
        console.log(err);
        this.toastr.error(err.error.msg,'Server Error');
      })
  }

  logout(){
    console.log("user logged out");
    this.authenticatationState.next(false);
    this.userAgreementState.next(false);
    localStorage.removeItem('accepted-agreement');
    localStorage.removeItem('token');
    this.isLoggedIn=false;
    this.userData={};
    this.toastr.success("Logged out",'Success');
    this.router.navigate(['/quizfinish']);
  }





}
