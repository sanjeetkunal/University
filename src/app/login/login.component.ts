import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {  Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    private http:HttpClient,
    private toastr: ToastrService,
    private auth:AuthService,
    private router:Router) { }

  loading:boolean=false;
  SubmitButtonText:string="Login";

  async loginUser(logindata: any) {
    const { mobile, password } = logindata.value;
    if (mobile == "" || password == "") {
      this.toastr.error("Please Fill All Requird fields");
      this.SubmitButtonText="Login";
    } else {
      this.SubmitButtonText=`Please Wait...`;
      this.auth.loginService(logindata.value)
      console.log(logindata.value);
      this.loading = false;
    }
  }

}
