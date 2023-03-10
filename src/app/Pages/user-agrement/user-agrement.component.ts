import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-user-agrement',
  templateUrl: './user-agrement.component.html',
  styleUrls: ['./user-agrement.component.scss']
})
export class UserAgrementComponent implements OnInit {
  internetDown: boolean = false;
  checked = false;
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private auth: AuthService,
    private router: Router,
    public dialog: MatDialog, private connectionService: ConnectionService
  ) {
    this.connectionService.monitor().subscribe(isConnected => {
      if (!isConnected.hasInternetAccess && !isConnected.hasNetworkConnection) {
        if (!this.internetDown) {
          this.internetDown=true;
          this.logout();
          this.toastr.warning("Internet not connected with your device. You can login again and continue your test.");          
        }
      }
    });
  }

  userloggedin: boolean = false;
  username: any;
  subjectname: any;
  ques_ready: any;

  ngOnInit() {
    // this.auth.removesession();
    // this.username = this.auth.username;
    // this.subjectname = this.auth.subjectname;
    this.username = localStorage.getItem('username');
    this.subjectname = localStorage.getItem('subjectname');
    // console.log(this.username, this.subjectname);
    // console.log(this.auth.username, this.auth.subjectname);

    this.checkQuestion();


    if (localStorage.getItem('accepted-agreement')) {
      this.auth.userAgreementState.next(true);

      if (this.auth.isAuthenticated()) {
        this.router.navigate(['/quiz']);
      }

    }
    console.log(this.auth.userAgreementState.value);

  }

  checkQuestion() {
    let reqbody: any = {};
    let userid = localStorage.getItem('USERID');
    let token = localStorage.getItem('token');
    reqbody.userID = userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    let url = `https://entrance.skduniversity.com/api/v1/auth/questionPaperAssigned`;
    this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
      console.log(res);
      this.ques_ready = res;
    }, err => {
      console.log(err);
      this.toastr.error(err.message);

    })
  }

  IsUserAgreeTermsAndCondition: boolean = false;
  agree() {
    if (this.IsUserAgreeTermsAndCondition) {
      if (!this.ques_ready) {
        this.toastr.error("Question paper have Not Been Assigned Yet")
      } else {
        this.auth.userAgreementState.next(true);
        localStorage.setItem('accepted-agreement', 'true');
        this.router.navigateByUrl('/quiz');
      }
    }
  }

  notAgree() {
    this.auth.userAgreementState.next(false);
    this.toastr.error("Please Agree with terms and condition");
  }

  logout() {
    this.auth.logout();
    this.userloggedin = false;
  }

  DialogMessage: string = "";
  AgreeYes: string = "Yes";
  AgreeNo: string = "Close";
  AgreeYesShow: string = "block";

  openDialogWithRef(ref: TemplateRef<any>) {
    if (this.IsUserAgreeTermsAndCondition) {
      this.AgreeYes = "Yes";
      this.AgreeNo = "No";
      this.AgreeYesShow = "block";
      this.DialogMessage = "Are you sure want to start your entrance TEST!";
      this.dialog.open(ref);
    }
    else {
      this.AgreeYesShow = "none";
      this.DialogMessage = "Please select terms and conditins!";
      this.AgreeNo = "Close";
      this.dialog.open(ref);
    }
  }

  IAgreeChecked(event: any) {
    this.IsUserAgreeTermsAndCondition = false;
    if (event.target.checked) {
      this.IsUserAgreeTermsAndCondition = true;
    }
  }



}



