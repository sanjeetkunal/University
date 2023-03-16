import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectionService } from 'ng-connection-service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { filter } from 'rxjs/operators';

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
    private router: Router, private connectionService: ConnectionService,
    private deviceService: DeviceDetectorService) {
    this.connectionService.monitor().subscribe(isConnected => {
      if (!isConnected.hasInternetAccess && !isConnected.hasNetworkConnection) {
        if (!this.internetDown) {
          this.internetDown = true;
          this.auth.logout();
          this.toastr.warning("Internet not connected with your device. You can login again and continue your test.");
        }
      }
    });
    window.addEventListener("blur", () => {
      this.final_res_server.onblur = "blur submit"
      //this.epicFunction(); 
    });
    //window.addEventListener("focus", () => { });

    //     window.addEventListener("keydown",
    //     function (event) { 
    //       if (event.keyCode == 116 || (event.keyCode == 65+17 && event.ctrlKey)) { 
    //          alert('You cannot reload this page'); 
    //          event.preventDefault();
    //     } 
    // });

    this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd)).subscribe(event => {
      if (event.id === 1 && event.url === event.urlAfterRedirects) {
        let prevFiveQuestion = localStorage.getItem("FiveQuestionSet");
        if (prevFiveQuestion !== undefined && prevFiveQuestion !== null) {
          this.selectedFiveQuestionsListTesting = JSON.parse(prevFiveQuestion || "");
          if (this.selectedFiveQuestionsListTesting !== null) {
            const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
            let url = `https://entrance.skduniversity.com/api/v1/auth/saveOneAnswer`;
            this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, userResponses: this.selectedFiveQuestionsListTesting }
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
    if (isDesktopDevice) { this.submitFullResponse(); }
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

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.subjectname = localStorage.getItem('subjectname');
    this.userid = localStorage.getItem('userid');
    this.token = localStorage.getItem('token');
    this.userChecker();
  }

  GetAllQuestionsSet() {
    let reqbody: any = {};
    reqbody.userID = this.userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = `https://entrance.skduniversity.com/api/v1/auth/getUserQuestionPaper`;
    this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
       this.userQuestionDetails = res;
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

  startTimer() {
    let t: any = window.setInterval(() => {
      this.ManageTimmerCounter(this.minutes, this.seconds, "manage");
      if (this.timer <= 0) { this.submitFullResponse(); clearInterval(t); }
      else { this.timer--; }
    }, 1000);
  }

  getFormatedTimer() {
    this.minutes = Math.floor(this.timer / 60);
    this.seconds = this.timer - parseInt(this.minutes) * 60;
    return `${this.minutes} Min : ${this.seconds} Sec`;
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

  selectedFiveQuestionsList: any = [];
  SaveFiveQuestionRequest = { userID: "", subject: "", minutes: "", seconds: "", userResponses: [] };
  GoToNextQuestion() {    
    this.HindiDivClass = "form-group";
    this.EnglishDivClass = "form-group";
    if (!this.userQuestionDetails.userquestionSet[this.questionCounter].selected && this.student_res.selected_prop) {
      this.subjectname=this.userQuestionDetails.subject;
      this.userid=this.userQuestionDetails.userID;

      this.selectedQuestion.selected = true;
      this.selectedQuestion.selectedoptions = this.student_res.selected_opt;
      var objSelectedQues = { questionid: this.selectedQuestion.questionid, selected: this.selectedQuestion.selected, selectedoptions: this.selectedQuestion.selectedoptions, responsemode: this.selectedQuestion.responsemode };
      this.selectedFiveQuestionsList.push(objSelectedQues);
      localStorage.setItem("FiveQuestionSet", JSON.stringify(this.selectedFiveQuestionsList));
      if (this.selectedFiveQuestionsList.length === 5) {
        const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
        let url = `https://entrance.skduniversity.com/api/v1/auth/saveOneAnswer`;
        this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, userResponses: this.selectedFiveQuestionsList }
        this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
          this.selectedFiveQuestionsList = [];
          localStorage.removeItem("FiveQuestionSet");
        });
      }
    }

    this.buttonChecked = null;
    this.EnglishLanguage = false;
    this.HindiLanguage = false;
    if (this.questionCounter < this.totalQuestions.length - 1) {
      this.questionCounter++;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      this.buttonChecked = null;
    } else {
      this.router.navigateByUrl('/quizfinish');
      this.submitFullResponse();
    }
  }

  prevQues() {
    this.selectedQuestion = null;
    if (this.questionCounter == 0) { this.toastr.error("No Previous Questions"); }
    else {
      this.questionCounter--;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
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

  // singleQuesRes(e: any) {
  //   this.selectedQuestion.selected = true;
  //   this.selectedQuestion.selectedoptions = e.value;
  //   if ((e.target).className.includes("english_radio")) {
  //     this.selectedQuestion.responsemode = "ENGLISH";
  //     this.HindiDivClass = this.HindiDivClass + " div-disabled";
  //   }
  //   else {
  //     this.selectedQuestion.responsemode = "HINDI";
  //     this.EnglishDivClass = this.EnglishDivClass + " div-disabled";
  //   }
  //   this.full_response.add(this.selectedQuestion);
  // }

  singleQuesResNew(e: any) {
    this.student_res.selected_prop = true;
    this.student_res.selected_opt = e.target.name;
    if ((e.target).className.includes("english_radio")) { this.selectedQuestion.responsemode = "ENGLISH"; this.HindiDivClass = this.HindiDivClass + " div-disabled";}
    else { this.selectedQuestion.responsemode = "HINDI"; this.EnglishDivClass = this.EnglishDivClass + " div-disabled";}
    this.full_response.add(this.selectedQuestion);
  }

  selectedFinalQuestionsList: any = [];
  submitFullResponse() {
    let prevFiveQuestion = localStorage.getItem("FiveQuestionSet");
    if (prevFiveQuestion !== undefined && prevFiveQuestion !== null) {
      this.selectedFinalQuestionsList = JSON.parse(prevFiveQuestion || "");
    }
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = `https://entrance.skduniversity.com/api/v1/auth/saveUserTest`;
    this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, userResponses: this.selectedFinalQuestionsList }
    this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
      this.selectedFinalQuestionsList = [];
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
}
