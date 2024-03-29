import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private http:HttpClient,
    private toastr: ToastrService,
    private auth:AuthService,
    private router:Router) { }
  title = 'College';
  userloggedin:boolean=false;
  username:any;
  subjectname:any;


  ngOnInit(){
   // window.location.href = "https://entrance.skduniversity.com/ui/";
    // if(localStorage.getItem('token')){
    //   this.auth.authenticatationState.next(true);
    //   console.log()
    //   setTimeout(()=>{
    //     this.userloggedin  = this.auth.isLoggedIn;
    //     this.username = this.auth.username;
    //     this.subjectname = this.auth.subjectname;
    //   },2000)
    //   this.router.navigateByUrl('/user-agrement');
    // }
  }

  // logout(){
  //   this.auth.logout();
  //   this.userloggedin=false;
  // }

  onRightClick() {
    return false;
  }
}
