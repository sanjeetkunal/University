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
          this.internetDown = true;
          this.logout();
          this.toastr.warning("Internet not connected with your device. You can login again and continue your test.");
        }
      }
    });
  }

  selectedFinalQuestionsList: any = [];
  checkUserQuizActivatedOrNot() {
    let quizActive = localStorage.getItem("quizactive") == null ? "false" : localStorage.getItem("quizactive");
    if (quizActive === "true") {
      let prevFiveQuestion = localStorage.getItem("FiveQuestionSet");
      let minutes = localStorage.getItem('minuts');
      let seconds = localStorage.getItem('seconds');
      let userid = localStorage.getItem('userid');
      if (prevFiveQuestion !== undefined && prevFiveQuestion !== null) {
        this.selectedFinalQuestionsList = JSON.parse(prevFiveQuestion || "");
        let SaveFiveQuestionRequest = { userID: userid, subject: this.subjectname, minutes: minutes, seconds: seconds, submissionevent: "backfromquiz", userResponses: this.selectedFinalQuestionsList }
        const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
        let url = this.auth.baseUrl + `v1/auth/saveOneAnswer`;
        this.http.post(url, SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
          this.auth.logout();
        });
      }
      else{
        this.auth.logout();
      }
    }
  }

  //userloggedin: boolean = false;
  username: any;
  subjectname: any;
  ques_ready: any;
  token: any;
  IsUserAgreeTermsAndCondition: boolean = false;

  ngOnInit() {
    this.IsUserAgreeTermsAndCondition = false;
    this.token = localStorage.getItem('token');
    this.username = localStorage.getItem('username');
    this.subjectname = localStorage.getItem('subjectname');

    if (this.token !== null) {
      this.auth.userAgreementState.next(true);
      this.checkUserQuizActivatedOrNot();
    }
  }

  // checkQuestion() {
  //   let reqbody: any = {};
  //   let userid = localStorage.getItem('USERID');
  //   let token = localStorage.getItem('token');
  //   reqbody.userID = userid;
  //   const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);

  //   let url = `https://entrance.skduniversity.com/api/v1/auth/questionPaperAssigned`;
  //   this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
  //     console.log(res);
  //     this.ques_ready = res;
  //   }, err => {
  //     console.log(err);
  //     this.toastr.error(err.message);

  //   })
  // }


  // agree() {
  //   if (this.IsUserAgreeTermsAndCondition) {
  //     if (!this.ques_ready) {
  //       this.toastr.error("Question paper have Not Been Assigned Yet")
  //     } else {
  //       this.auth.userAgreementState.next(true);
  //       localStorage.setItem('accepted-agreement', 'true');
  //       this.router.navigateByUrl('/quiz');
  //     }
  //   }
  // }

  notAgree() {
    this.auth.userAgreementState.next(false);
    this.toastr.error("Please Agree with terms and condition");
  }

  logout() { this.auth.logout(); }

  DialogMessage: string = "";
  AgreeYes: string = "Yes";
  AgreeNo: string = "Close";
  AgreeYesShow: string = "block";

  CheckTermsConditionAcceptOrNot(ref: TemplateRef<any>) {
    if (this.token !== null && this.IsUserAgreeTermsAndCondition) {
      this.AgreeYes = "Yes";
      this.AgreeNo = "No";
      this.AgreeYesShow = "block";
      this.DialogMessage = "Are you sure want to start your entrance TEST? <br/> क्या आप वाकई अपनी प्रवेश परीक्षा शुरू करना चाहते हैं?";
      this.dialog.open(ref);
    }
    else {
      this.AgreeYesShow = "none";
      this.DialogMessage = "Please select terms and conditins! <br/> कृपया नियम और शर्तें चुनें!";
      this.AgreeNo = "Close";
      this.dialog.open(ref);
    }
  }

  IAgreeChecked(event: any) {
    this.IsUserAgreeTermsAndCondition = false;
    if (event.target.checked) {
      this.IsUserAgreeTermsAndCondition = true;
      localStorage.setItem('user-accepted', 'true')
    }
  }

  AcceptTermsCondition() {
    if (this.token !== null && this.IsUserAgreeTermsAndCondition) {
      this.router.navigateByUrl('/quiz');
    }
  }
}



