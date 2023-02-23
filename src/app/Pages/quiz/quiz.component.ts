import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private auth: AuthService,
    private router: Router) { }

  answer: string = "";
  totalQuestions = [];
  selectedQuestion: any;
  questionCounter = 0;
  res_array:any=[];
  answerSelect:any;
  full_response = new Set();
  buttonChecked:any;
  final_res_server:any={};
  endTestIn:any;


  ngOnInit(): void {
    if (!this.auth.userAgreementState.value) {
      this.router.navigateByUrl('/user-agrement')
      this.toastr.error("Please Accept User Terms Agreement");
    }
   
    this.loadQuestions();

  }

  temp_res: any;

  loadQuestions() {
    console.log("load questions running")
    let reqbody: any = {};
    let userid = localStorage.getItem('USERID');
    let token = localStorage.getItem('token');
    reqbody.userID = userid;
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    // let headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': `Bearer ${token}`
    // })

    let url = `http://103.44.53.3:8080/api/v1/auth/getUserQuestionPaper`;
    console.log(reqHeader);
    this.http.post(url, reqbody, { headers: reqHeader }).subscribe(res => {
      console.log(res);
      this.temp_res = res;
      this.totalQuestions = this.temp_res.userquestionSet;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      this.timer();
      // console.log("first selected question", this.selectedQuestion);
      let minute = this.temp_res.remainingMinutes;
      let second = this.temp_res.remainingSeconds;
      let totalSeconds = ((minute * 60)+second)*1000;
      console.log("Test will end in",totalSeconds);
      setTimeout(()=>{
        console.log("Test will end in",totalSeconds);
        this.submitFullResponse();
      },totalSeconds);


    }, err => {
      console.log(err);
      this.toastr.error(err.message);
    })
  }

  stopTimer: any;
  time = 0;
  dt = new Date(new Date().setTime(0));
  ctime = this.dt.getTime();
  seconds = Math.floor((this.ctime % (1000 * 60)) / 1000);
  minute = Math.floor((this.ctime % (1000 * 60 * 60)) / (1000 * 60));
  formated_sec: any = "59";
  formated_min: any = "30";


  timer() {
    this.stopTimer = setInterval(() => {
      this.time++;
      if (this.seconds < 59) {
        this.seconds++;
        
      }
      else {
        this.seconds = 0;
        this.minute++;
      }
      this.formated_sec = this.seconds < 10 ? `0${this.seconds}` : `${this.seconds}`;
      this.formated_min = this.minute < 10 ? `0${this.minute}` : `${this.minute}`;
    },1000)
  }

  nextQues() {
    // console.log("-----------prev--------",this.totalQuestions[this.questionCounter])
    //submitting the question
    console.log(this.selectedQuestion);
    let userid = localStorage.getItem('USERID');
    this.selectedQuestion.userID = userid;
    let token = localStorage.getItem('token');
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    let url = `http://103.44.53.3:8080/api/v1/auth/saveOneAnswer`;
    this.http.post(url, this.selectedQuestion, { headers: reqHeader }).subscribe(res => {
      console.log(res);
      let server_res:any = res;
      //this.toastr.success(server_res.message);
    })
    this.EnglishLanguage = false;
    this.HindiLanguage = false;
    if (this.questionCounter < this.totalQuestions.length - 1) {
      this.questionCounter++;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      // console.log("next questtion", this.selectedQuestion)
      this.buttonChecked=null;
      // this.buttonChecked=true;

    } else {
      //this.toastr.error("No further Questions");
      this.router.navigateByUrl('/quizfinish');
      this.submitFullResponse();
    }
    // console.log("-----------after--------",this.totalQuestions[this.questionCounter])


  }

  prevQues() {
    if (this.questionCounter == 0) {
      this.toastr.error("No Previous Questions");
    }
    else {
      this.questionCounter--;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      // console.log("prev questtion", this.selectedQuestion)
    }

  }

  singleQuesRes(e: any) {
    console.log(e.value);
    this.selectedQuestion.selected=true;
    this.selectedQuestion.selectedoptions=e.value;
    console.log(this.selectedQuestion);

    
    this.full_response.add(this.selectedQuestion);
    console.log(this.full_response);

  }

  singleQuesResNew(e:any){
    // let questionSaved = localStorage
    this.selectedQuestion.selected=true;
    this.selectedQuestion.selectedoptions=e.target.name;
    console.log(e.target.name,e.target.value);
    console.log(this.selectedQuestion);

    this.full_response.add(this.selectedQuestion);
    console.log(this.full_response);

  }

  submitFullResponse(){
    let userid = localStorage.getItem('USERID');

    //converting set data to array
    for(let answer of this.full_response){
      console.log(answer);
      this.res_array.push(answer);
    };
    this.final_res_server.candidateTest = this.res_array;
    this.final_res_server.userID = userid;
    this.final_res_server.minutes=20;
    this.final_res_server.seconds=10;

    
    console.log("final request sent to server",this.final_res_server);


    this.selectedQuestion.userID=userid;
    let token = localStorage.getItem('token');
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    let url=`http://103.44.53.3:8080/api/v1/auth/saveUserTest`;
    this.http.post(url,this.final_res_server,{headers:reqHeader}).subscribe(res=>{
      console.log(res);
      let server_res:any = res;
      this.toastr.success(server_res.message);
    })
    //this.router.navigateByUrl('/quizfinish');
  }

  radioChange(e: any) {
    console.log(e);
  }

  EnglishLanguage: boolean = false;
  HindiLanguage: boolean = false;
  onLanguageClicked(language: string) {
    if (language == "hindi") {
      if (!this.HindiLanguage) {
        this.EnglishLanguage = true;
      }
    }
    else {
      if (!this.EnglishLanguage) {
        this.HindiLanguage = true;
      }
    }
  }

  isCheckedQuestion(option:any,realOtion:any){
    console.log(option,realOtion);
    // if(option === realOtion){
    //   return "selected"
    // }
    // return "unselected"
  }
}
