import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-agrement',
  templateUrl: './user-agrement.component.html',
  styleUrls: ['./user-agrement.component.scss']
})
export class UserAgrementComponent implements OnInit{

  checked=false;
  constructor(
    private http:HttpClient,
    private toastr: ToastrService,
    private auth:AuthService,
    private router:Router) { }

    userloggedin:boolean=false;
    username:any;
    subjectname:any;

ngOnInit(){

    this.username = this.auth.username;
    this.subjectname = this.auth.subjectname;
    console.log(this.username,this.subjectname);
    console.log(this.auth.username,this.auth.subjectname);


  if(localStorage.getItem('accepted-agreement') ){
    this.auth.userAgreementState.next(true);
   
    if(this.auth.isAuthenticated()){
      this.router.navigate(['/quiz']);
    }
   
  }
  console.log(this.auth.userAgreementState.value);

}

agree(){
  this.auth.userAgreementState.next(true);
  localStorage.setItem('accepted-agreement','true');
  this.router.navigateByUrl('/quiz');
}

notAgree(){
  this.auth.userAgreementState.next(false);
  this.toastr.error("Please Agree with terms and condition");
}

logout(){
  this.auth.logout();
  this.userloggedin=false;
}



}
