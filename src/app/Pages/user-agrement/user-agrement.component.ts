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

ngOnInit(){
  console.log(this.auth.userAgreementState.value);
}

agree(){
  this.auth.userAgreementState.next(true);
  this.router.navigateByUrl('/quiz');
}

notAgree(){
  this.auth.userAgreementState.next(false);
  this.toastr.error("Please Agree with terms and condition");
}


}
