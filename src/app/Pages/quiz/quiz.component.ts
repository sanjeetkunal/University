import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ConnectionService } from 'ng-connection-service';
import { DeviceDetectorService } from 'ngx-device-detector';

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
      //this.epicFunction(); 
    });
    //window.addEventListener("focus", () => { });
  }

  deviceInfo: any = null;
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //const isMobile = this.deviceService.isMobile();
    //const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    if (isDesktopDevice) { debugger; this.submitFullResponse(); }
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
  temp_res: any;
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
    this.GetAllQuestionsSet();
  }

  GetAllQuestionsSet() {
    let reqbody: any = {};
    reqbody.userID = this.userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = `https://entrance.skduniversity.com/api/v1/auth/getUserQuestionPaper`;
    this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
      this.temp_res = res;
      this.username = this.temp_res.candidateName;
      this.subjectname = this.temp_res.subject;
      this.totalQuestions = this.temp_res.userquestionSet;
      if (this.totalQuestions.length > 0) {
        for (let i = 0; i < this.totalQuestions.length; i++) {
          this.singleQuestion = this.totalQuestions[i];
          if (!this.singleQuestion.selected) { this.questionCounter = i; break; }
        }
        this.selectedQuestion = this.totalQuestions[this.questionCounter];
        var sessionMinuts = localStorage.getItem('minuts_' + this.userid);
        var sessionSeconds = localStorage.getItem('seconds_' + this.userid)
        if (sessionMinuts !== null && sessionSeconds !== null) { this.timer = (parseInt(sessionMinuts) * 60) + parseInt(sessionSeconds); }//second  
        else { this.timer = (parseInt(this.temp_res.remainingMinutes) * 60) + parseInt(this.temp_res.remainingSeconds); }//second
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
      localStorage.setItem('minuts_' + this.userid, this_minutes);
      localStorage.setItem('seconds_' + this.userid, this_seconds);
    }
    else {
      this.minutes = localStorage.getItem('minuts_' + this.userid);
      this.seconds = localStorage.getItem('seconds_' + this.userid);
    }
  }

  selectedFiveQuestionsList: any = [];
  SaveFiveQuestionRequest = { userID: "", subject: "", minutes: "", seconds: "", userResponses: [] };
  GoToNextQuestion() {
    this.HindiDivClass = "form-group";
    this.EnglishDivClass = "form-group";
    if (!this.temp_res.userquestionSet[this.questionCounter].selected && this.student_res.selected_prop) {
      this.selectedQuestion.selected = true;
      this.selectedQuestion.selectedoptions = this.student_res.selected_opt;
      var objSelectedQues = { questionid: this.selectedQuestion.questionid, selected: this.selectedQuestion.selected, selectedoptions: this.selectedQuestion.selectedoptions, responsemode: this.selectedQuestion.responsemode };
      this.selectedFiveQuestionsList.push(objSelectedQues);
      if (this.selectedFiveQuestionsList.length === 5) {
        const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
        let url = `https://entrance.skduniversity.com/api/v1/auth/saveOneAnswer`;
        this.SaveFiveQuestionRequest = { userID: this.userid, subject: this.subjectname, minutes: this.minutes, seconds: this.seconds, userResponses: this.selectedFiveQuestionsList }
        this.http.post(url, this.SaveFiveQuestionRequest, { headers: reqHeader }).subscribe(res => {
          this.selectedFiveQuestionsList = [];
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

  singleQuesRes(e: any) {
    this.selectedQuestion.selected = true;
    this.selectedQuestion.selectedoptions = e.value;
    if ((e.target).className.includes("english_radio")) {
      this.selectedQuestion.responsemode = "ENGLISH";
      this.HindiDivClass = this.HindiDivClass + " div-disabled";
    }
    else {
      this.selectedQuestion.responsemode = "HINDI";
      this.EnglishDivClass = this.EnglishDivClass + " div-disabled";
    }
    this.full_response.add(this.selectedQuestion);
  }

  singleQuesResNew(e: any) {
    this.student_res.selected_prop = true;
    this.student_res.selected_opt = e.target.name;
    if ((e.target).className.includes("english_radio")) { this.selectedQuestion.responsemode = "ENGLISH"; }
    else { this.selectedQuestion.responsemode = "HINDI"; }
    this.full_response.add(this.selectedQuestion);
  }

  submitFullResponse() {
    for (let answer of this.full_response) { this.res_array.push(answer); };
    this.final_res_server.candidateTest = this.res_array;
    this.final_res_server.userID = this.userid;
    this.final_res_server.minutes = this.minutes;
    this.final_res_server.seconds = this.seconds;
    this.selectedQuestion.userID = this.userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + this.token);
    let url = `https://entrance.skduniversity.com/api/v1/auth/saveUserTest`;
    this.http.post(url, this.final_res_server, { headers: reqHeader }).subscribe(res => {
      let server_res: any = res;
      this.auth.removesession();
    });
    this.router.navigateByUrl('/quizfinish');
  }

  EnglishLanguage: boolean = false;
  HindiLanguage: boolean = false;
  onLanguageClicked(language: string) {
    if (language == "hindi") { if (!this.HindiLanguage) { this.EnglishLanguage = true; } }
    else { if (!this.EnglishLanguage) { this.HindiLanguage = true; } }
  }

  //time_req = { userid: "", activestatus: "active", minutesleft: 30, secondsleft: 30 }

  // submitTime() {
  //   let token = localStorage.getItem('token');
  //   let userid = localStorage.getItem('USERID');
  //   if (userid) this.time_req.userid = userid;
  //   this.time_req.minutesleft = this.minutes;
  //   this.time_req.secondsleft = this.seconds;
  //   if (parseInt(this.minutes) === 0) {
  //     this.time_req.activestatus = "inactive";
  //   }

  //   const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
  //   let url = `https://entrance.skduniversity.com/api/v1/auth/saveRemainingTime`;
  //   console.log(reqHeader);
  //   this.http.post(url, this.time_req, { headers: reqHeader }).subscribe(res => {
  //     console.log(res);

  //   })
  // }  
}
