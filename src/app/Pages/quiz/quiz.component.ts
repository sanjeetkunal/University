import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectionService } from 'ng-connection-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  internetDown: boolean = false;
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private auth: AuthService,
    public dialog: MatDialog,
    private router: Router, private connectionService: ConnectionService,
    private deviceService: DeviceDetectorService) {
    localStorage.setItem('quizactive', 'true');
    this.connectionService.monitor().subscribe(isConnected => {
      this.setUserSessionDetails();
      if (!isConnected.hasInternetAccess && !isConnected.hasNetworkConnection) {
        if (!this.internetDown) {
          this.internetDown = true;
          this.auth.logout();
          this.toastr.warning("Internet not connected with your device. You can login again and continue your test.");
        }
      }
    });
    window.addEventListener("blur", () => {
      //console.log("blur submit");
      this.final_res_server.onblur = "blur submit";
      //this.SaveTimingAfter1Mint();
      this.epicFunction();
    });
    window.addEventListener("focus", () => { });
    window.addEventListener("keydown",
      function (event) {
        if (event.keyCode == 116 || (event.keyCode == 65 + 17 && event.ctrlKey)) {
          alert('You cannot reload this page');
          event.preventDefault();
        }
      });

    this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd)).subscribe(event => {
      if (event.id === 1 && event.url === event.urlAfterRedirects) {
        let prevFiveQuestion = localStorage.getItem("FiveQuestionSet");
        if (prevFiveQuestion !== undefined && prevFiveQuestion !== null) {
          this.selectedFiveQuestionsListTesting = JSON.parse(prevFiveQuestion || "");
          if (this.selectedFiveQuestionsListTesting !== null) {
            const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
            let url = this.auth.baseUrl + `v1/auth/saveOneAnswer`;
            this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, submissionevent: "pagereload", userResponses: this.selectedFiveQuestionsListTesting }
            this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
              this.selectedFiveQuestionsListTesting = [];
              localStorage.removeItem("FiveQuestionSet");
            });
          }
        }
      }
    })
  }

  selectedFiveQuestionsListTesting: any = [];
  deviceInfo: any = null;
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //const isMobile = this.deviceService.isMobile();
    //const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    if (isDesktopDevice) { 
      localStorage.setItem('cheatingattempted', 'true');
      this.submitFullResponse("cheatingattempted");
     }
  }

  userChecker() {
    let user_accepted = localStorage.getItem('user-accepted');
    if (this.token !== null) {
      this.GetAllQuestionsSet();
      if (user_accepted === 'true') {
        this.auth.authenticatationState.next(true);
        setTimeout(() => {
          this.username = localStorage.getItem('username');
          this.subjectname = localStorage.getItem('subjectname');
        }, 2000)
      } else {
        this.toastr.warning("Please accept the User Agreement");
        this.router.navigate(['/user-agrement']);
      }
    } else {
      this.auth.logout();
    }
  }

  answer: string = "";
  totalQuestions = [];
  totalQuestionsNumber: any;
  selectedQuestion: any;
  questionCounter = 0;
  res_array: any = [];
  answerSelect: any;
  full_response = new Set();
  buttonChecked: any;
  final_res_server: any = {};
  endTestIn: any;
  username: any;
  subjectname: any;
  userQuestionDetails: any;
  student_res = { selected_prop: false, selected_opt: "", };

  singleQuestion = {
    hindiorenglish: null,
    hioptionA: "", hioptionAselected: false, hioptionB: "", hioptionBselected: false, hioptionC: "", hioptionCselected: false,
    hioptionD: "", hioptionDselected: false, hiquestion: "", optionA: "", optionAselected: false, optionB: "",
    optionBselected: false, optionC: "", optionCselected: false, optionD: "", optionDselected: false, question: "",
    questionid: 0, radioorcheck: null, responsemode: null, selected: false, selectedoptions: null, sequenceno: 0
  };

  EnglishDivClass: string = "form-group";
  HindiDivClass: string = "form-group";
  userid: any;
  token: any;
  timer: any;
  minutes: any;
  seconds: any;
  CheckTimingColor:String="reamingtimingcolorblack";

  ngOnInit(): void {
    //this.setUserSessionDetails();
  }

  setUserSessionDetails() {
    this.username = localStorage.getItem('username');
    this.subjectname = localStorage.getItem('subjectname');
    this.userid = localStorage.getItem('userid');
    this.token = localStorage.getItem('token');
    this.minutes = localStorage.getItem('minuts');
    this.seconds = localStorage.getItem('seconds');
    if (this.token !== null && this.userid !== null && this.username !== null && this.subjectname !== null) {
      this.userChecker();
    }
    else {
      this.auth.logout();
    }
  }

  GetAllQuestionsSet() {
    let reqbody: any = {};
    reqbody.userID = this.userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = this.auth.baseUrl + `v1/auth/getUserQuestionPaper`;
    this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
      this.userQuestionDetails = res;
      this.totalQuestionsNumber = this.userQuestionDetails.userquestionSet;
      //console.log(res);
      this.username = this.userQuestionDetails.candidateName;
      //localStorage.setItem('username',this.username);
      this.subjectname = this.userQuestionDetails.subject;
      //localStorage.setItem('subjectname',this.subjectname);
      this.userid = this.userQuestionDetails.userID;
      //localStorage.setItem('userid',this.userid);


      this.totalQuestions = this.userQuestionDetails.userquestionSet;
      if (this.totalQuestions.length > 0) {
        for (let i = 0; i < this.totalQuestions.length; i++) {
          this.singleQuestion = this.totalQuestions[i];
          if (!this.singleQuestion.selected) { this.questionCounter = i; break; }
        }
        this.selectedQuestion = this.totalQuestions[this.questionCounter];
        var sessionMinuts = localStorage.getItem('minuts');
        var sessionSeconds = localStorage.getItem('seconds');
        if (sessionMinuts !== null && sessionMinuts !== "NaN" && sessionSeconds !== "NaN" && sessionSeconds !== null) { this.timer = (parseInt(sessionMinuts) * 60) + parseInt(sessionSeconds); }//second  
        else { this.timer = (parseInt(this.userQuestionDetails.remainingMinutes) * 60) + parseInt(this.userQuestionDetails.remainingSeconds); }//second
        this.startTimer();
      }
      else {
        this.toastr.error("Questions paper not assigned yet, please connect with administrator.");
        this.auth.logout();
      }
    }, err => {
      this.auth.logout();
      this.toastr.error(err.message);
    })
  }

  getQuestionClass(questionStatus: any) {
    //if(questionStatus!==null){      
    if (questionStatus == true) {
      return "submitted-question";
    }
    //}
    return "";
  }

  gotoParticularQuestionByNumbering(questionNumber: number) {
    this.buttonChecked = null;
    this.questionCounter = questionNumber - 1;
    this.selectedQuestion = this.totalQuestions[questionNumber - 1];
    this.HindiDivClass = "form-group";
    this.EnglishDivClass = "form-group";
    if (this.selectedQuestion.hiquestion === null) {
      this.HindiDivClass = "div-displaynone";
    }
  }

  showMinSecHtml: any;
  startTimer() {
    let t: any = window.setInterval(() => {
      if (this.timer <= 0) {
        this.submitFullResponse("timezero");
        clearInterval(t);
      }
      else {        
        this.getFormatedTimer();
        this.timer--;
      }
    }, 1000);
  }

  getFormatedTimer() {
    let currentMinutes = this.minutes;
    this.minutes = Math.floor(this.timer / 60);
    this.seconds = this.timer - parseInt(this.minutes) * 60;
    this.ManageTimmerCounter(this.minutes, this.seconds, "manage");
    this.showMinSecHtml = `${this.minutes} Min : ${this.seconds} Sec`;
    if (this.minutes > 0 && currentMinutes > this.minutes) {
      this.SaveTimingAfter1Mint();
    }

    if(this.minutes<=5){this.CheckTimingColor="reamingtimingcolorred";}
  }

  ManageTimmerCounter(this_minutes: any, this_seconds: any, this_type: any) {
    if (this_type === "manage") {
      localStorage.setItem('minuts', this_minutes);
      localStorage.setItem('seconds', this_seconds);
    }
    else {
      this.minutes = localStorage.getItem('minuts');
      this.seconds = localStorage.getItem('seconds');
    }
  }

  SaveTimmer = { userid: "", minutesleft: "", secondsleft: "" };
  SaveTimingAfter1Mint() {
    this.minutes = localStorage.getItem('minuts');
    this.seconds = localStorage.getItem('seconds');
    this.userid = localStorage.getItem('userid');
    if (this.minutes !== null && this.seconds !== null && this.userid !== null) {
      let url = this.auth.baseUrl + `v1/auth/saveRemainingTime`;
      const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
      this.SaveTimmer = { userid: this.userid, minutesleft: this.minutes, secondsleft: this.seconds };
      this.http.post(url, this.SaveTimmer, { headers: reqHeader }).subscribe(res => {
        //console.log(res);
      });
    }
  }

  selectedFiveQuestionsList: any = [];
  selectedFiveQuestionsListUnderFive: any = [];
  SaveFiveQuestionRequest = { userID: "", subject: "", minutes: "", seconds: "", submissionevent: "", userResponses: [] };
  GoToNextQuestion() {
    this.HindiDivClass = "form-group";
    this.EnglishDivClass = "form-group";
    //console.log(this.userQuestionDetails.userquestionSet[this.questionCounter].selected);
    if (!this.userQuestionDetails.userquestionSet[this.questionCounter].selected && this.student_res.selected_prop) {
      this.subjectname = this.userQuestionDetails.subject;
      this.userid = this.userQuestionDetails.userID;

      this.selectedQuestion.selected = true;
      this.selectedQuestion.selectedoptions = this.student_res.selected_opt;

      //setting student_res to null
      this.student_res.selected_prop = false;
      this.student_res.selected_opt = "";

      var objSelectedQues = { questionid: this.selectedQuestion.questionid, selected: this.selectedQuestion.selected, selectedoptions: this.selectedQuestion.selectedoptions, responsemode: this.selectedQuestion.responsemode };
      
      if (this.selectedFiveQuestionsList.length > 0) {
        for (let i = 0; i < this.selectedFiveQuestionsList.length; i++) {
          if (this.selectedFiveQuestionsList[i].questionid === this.selectedQuestion.questionid) {
            this.selectedFiveQuestionsList.splice(i, 1);
          }
        }
      }

      this.selectedFiveQuestionsList.push(objSelectedQues);

      if(this.selectedFiveQuestionsListUnderFive.length>this.selectedFiveQuestionsList.length)
      {
        this.selectedFiveQuestionsList = this.selectedFiveQuestionsListUnderFive;
      }
      //localStorage.setItem("FiveQuestionSet", JSON.stringify(this.selectedFiveQuestionsList));
      if (this.selectedFiveQuestionsList.length === 5) {
        const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
        let url = this.auth.baseUrl + `v1/auth/saveOneAnswer`;
        this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, submissionevent: "fivequestion", userResponses: this.selectedFiveQuestionsList }
        //console.log(this.SaveFiveQuestionRequest);
        this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
          this.selectedFiveQuestionsList = [];
          this.selectedFiveQuestionsListUnderFive = [];
          localStorage.removeItem("FiveQuestionSet");
        });
      }
    }
    else {
      if (this.selectedFiveQuestionsListUnderFive.length > 0) {
        if (this.selectedFiveQuestionsListUnderFive.length == 5) {
          localStorage.setItem("FiveQuestionSet", JSON.stringify(this.selectedFiveQuestionsListUnderFive));
          const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
          let url = this.auth.baseUrl + `v1/auth/saveOneAnswer`;
          this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, submissionevent: (this.selectedFiveQuestionsListUnderFive.length + "question"), userResponses: this.selectedFiveQuestionsListUnderFive }
          //console.log(this.SaveFiveQuestionRequest);
          this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
            this.selectedFiveQuestionsList = [];
            this.selectedFiveQuestionsListUnderFive = [];
            localStorage.removeItem("FiveQuestionSet");
          });
        }
      }
    }

    this.EnglishLanguage = false;
    this.HindiLanguage = false;
    if (this.questionCounter < this.totalQuestions.length - 1) {
      this.questionCounter++;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];

      if (this.selectedFiveQuestionsListUnderFive.length > 0) {
        for (let i = 0; i < this.selectedFiveQuestionsListUnderFive.length; i++) {
          if (this.selectedFiveQuestionsListUnderFive[i].questionid === this.selectedQuestion.questionid) {
            this.selectedQuestion.selected=true;
            this.selectedQuestion.answeredThisQuestion=true;
            this.selectedQuestion.selectedoptions=this.selectedFiveQuestionsListUnderFive[i].selectedoptions;
            this.selectedQuestion.responsemode=this.selectedFiveQuestionsListUnderFive[i].responsemode;
            if (this.selectedQuestion.responsemode == "HINDI") {
              if (this.selectedQuestion.selectedoptions == "A") { this.selectedQuestion.hioptionAselected = true; }
              if (this.selectedQuestion.selectedoptions == "B") { this.selectedQuestion.hioptionBselected = true; }
              if (this.selectedQuestion.selectedoptions == "C") { this.selectedQuestion.hioptionCselected = true; }
              if (this.selectedQuestion.selectedoptions == "D") { this.selectedQuestion.hioptionDselected = true; }
            }
            else {
              if (this.selectedQuestion.selectedoptions == "A") { this.selectedQuestion.optionAselected = true; }
              if (this.selectedQuestion.selectedoptions == "B") { this.selectedQuestion.optionBselected = true; }
              if (this.selectedQuestion.selectedoptions == "C") { this.selectedQuestion.optionCselected = true; }
              if (this.selectedQuestion.selectedoptions == "D") { this.selectedQuestion.optionDselected = true; }
            }
          }
        }
      }

      if (this.selectedQuestion.hiquestion === null) {
        this.HindiDivClass = "div-displaynone";
      }
      this.buttonChecked = null;
    } else {
      this.router.navigateByUrl('/quizfinish');
      this.submitFullResponse("finalsubmission");
    }
  }

  prevQues() {
    this.student_res.selected_prop = false;
    this.student_res.selected_opt = "";
    this.HindiDivClass = "form-group";
    this.EnglishDivClass = "form-group";
    this.buttonChecked = null;
    this.selectedQuestion = null;
    if (this.questionCounter == 0) { this.toastr.error("No Previous Questions"); }
    else {
      this.questionCounter--;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      if (this.selectedQuestion.selected) {
        this.HindiDivClass = this.HindiDivClass + " div-disabled";
        this.EnglishDivClass = this.EnglishDivClass + " div-disabled";
        if (this.selectedQuestion.responsemode == "HINDI") {
          if (this.selectedQuestion.selectedoptions == "A") { this.selectedQuestion.hioptionAselected = true; }
          if (this.selectedQuestion.selectedoptions == "B") { this.selectedQuestion.hioptionBselected = true; }
          if (this.selectedQuestion.selectedoptions == "C") { this.selectedQuestion.hioptionCselected = true; }
          if (this.selectedQuestion.selectedoptions == "D") { this.selectedQuestion.hioptionDselected = true; }
        }
        else {
          if (this.selectedQuestion.selectedoptions == "A") { this.selectedQuestion.optionAselected = true; }
          if (this.selectedQuestion.selectedoptions == "B") { this.selectedQuestion.optionBselected = true; }
          if (this.selectedQuestion.selectedoptions == "C") { this.selectedQuestion.optionCselected = true; }
          if (this.selectedQuestion.selectedoptions == "D") { this.selectedQuestion.optionDselected = true; }
        }
      }

      if (this.selectedQuestion.hiquestion === null) {
        this.HindiDivClass = "div-displaynone";
      }
    }
  }

  // singleQuesResNew(e: any) {
  //   this.student_res.selected_prop = true;
  //   this.student_res.selected_opt = e.target.name;

  //   this.selectedQuestion.selectedoptions = e.target.name;
  //   if ((e.target).className.includes("english_radio")) {
  //     this.selectedQuestion.responsemode = "ENGLISH";
  //     this.HindiDivClass = this.HindiDivClass + " div-disabled";

  //     if (e.target.name === "A") { this.selectedQuestion.optionAselected = true; }
  //     else if (e.target.name === "B") { this.selectedQuestion.optionBselected = true; }
  //     else if (e.target.name === "C") { this.selectedQuestion.optionCselected = true; }
  //     else if (e.target.name === "D") { this.selectedQuestion.optionDselected = true; }
  //   }
  //   else {
  //     this.selectedQuestion.responsemode = "HINDI";
  //     this.EnglishDivClass = this.EnglishDivClass + " div-disabled";

  //     if (e.target.name === "A") { this.selectedQuestion.hioptionAselected = true; }
  //     else if (e.target.name === "B") { this.selectedQuestion.hioptionBselected = true; }
  //     else if (e.target.name === "C") { this.selectedQuestion.hioptionCselected = true; }
  //     else if (e.target.name === "D") { this.selectedQuestion.hioptionDselected = true; }
  //   }
  //   this.selectedQuestion.selected = "krishna";
  //   this.full_response.add(this.selectedQuestion);
  //   var objSelectedQues = { questionid: this.selectedQuestion.questionid, selected: true, selectedoptions: e.target.name, responsemode: this.selectedQuestion.responsemode };
  //   if (this.selectedFiveQuestionsListUnderFive.length > 0) {
  //     for (let i = 0; i < this.selectedFiveQuestionsListUnderFive.length; i++) {
  //       if (this.selectedFiveQuestionsListUnderFive[i].questionid === this.selectedQuestion.questionid) {
  //         this.selectedFiveQuestionsListUnderFive.splice(i, 1);
  //       }
  //     }
  //   }
  //   this.selectedFiveQuestionsListUnderFive.push(objSelectedQues);
  // }
  singleQuesResNew(e: any) {
    //console.log(e);
    this.student_res.selected_prop = true;
    this.student_res.selected_opt = e.target.name;
    if ((e.target).className.includes("english_radio")) { this.selectedQuestion.responsemode = "ENGLISH"; this.HindiDivClass = this.HindiDivClass + " div-disabled"; }
    else { this.selectedQuestion.responsemode = "HINDI"; this.EnglishDivClass = this.EnglishDivClass + " div-disabled"; }
    this.full_response.add(this.selectedQuestion);

    this.selectedQuestion.answeredThisQuestion = true;//for testing
    var objSelectedQues = { questionid: this.selectedQuestion.questionid, selected: true, selectedoptions: e.target.name, responsemode: this.selectedQuestion.responsemode };
    if (this.selectedFiveQuestionsListUnderFive.length > 0) {
      for (let i = 0; i < this.selectedFiveQuestionsListUnderFive.length; i++) {
        if (this.selectedFiveQuestionsListUnderFive[i].questionid === this.selectedQuestion.questionid) {
          this.selectedFiveQuestionsListUnderFive.splice(i, 1);
        }
      }
    }
    this.selectedFiveQuestionsListUnderFive.push(objSelectedQues);
    localStorage.setItem("FiveQuestionSet", JSON.stringify(this.selectedFiveQuestionsListUnderFive));
    if (this.selectedFiveQuestionsListUnderFive.length > 5) {
      //localStorage.setItem("FiveQuestionSet", JSON.stringify(this.selectedFiveQuestionsListUnderFive));
      const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
      let url = this.auth.baseUrl + `v1/auth/saveOneAnswer`;
      this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, submissionevent: (this.selectedFiveQuestionsListUnderFive.length + "question"), userResponses: this.selectedFiveQuestionsListUnderFive }
      //console.log(this.SaveFiveQuestionRequest);
      this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
        this.selectedFiveQuestionsList = [];
        this.selectedFiveQuestionsListUnderFive = [];
        localStorage.removeItem("FiveQuestionSet");
      });
    }
  }

  selectedFinalQuestionsList: any = [];
  submitFullResponse(sessionEventTest: any) {
    let prevFiveQuestion = localStorage.getItem("FiveQuestionSet");
    if (prevFiveQuestion !== undefined && prevFiveQuestion !== null) {
      this.selectedFinalQuestionsList = JSON.parse(prevFiveQuestion || "");
    }

    this.selectedFinalQuestionsList = this.selectedFiveQuestionsListUnderFive;

    // if (this.selectedFinalQuestionsList.length === 0) { 
    //   this.selectedFinalQuestionsList = this.selectedFiveQuestionsListUnderFive; 
    // }
    this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, submissionevent: sessionEventTest, userResponses: this.selectedFinalQuestionsList }

    //console.log(this.SaveFiveQuestionRequest);
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = this.auth.baseUrl + `v1/auth/saveUserTest`;
    this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
      this.selectedFinalQuestionsList = [];
      this.selectedFiveQuestionsListUnderFive=[];      
      this.auth.removesession();
      this.router.navigateByUrl('/quizfinish');
    });
  }

  EnglishLanguage: boolean = false;
  HindiLanguage: boolean = false;
  onLanguageClicked(language: string) {
    if (language == "hindi") { if (!this.HindiLanguage) { this.EnglishLanguage = true; } }
    else { if (!this.EnglishLanguage) { this.HindiLanguage = true; } }
  }

  openSubmitModal(ref: TemplateRef<any>) {
    this.dialog.open(ref);
  }

  logout() {
    this.auth.logout();
  }
}
