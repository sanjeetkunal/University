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
      // console.log("first selected question", this.selectedQuestion);
    }, err => {
      console.log(err);
      this.toastr.error(err.message);
    })
  }


  nextQues() {
    // console.log("-----------prev--------",this.totalQuestions[this.questionCounter])
    //submitting the question
    console.log(this.selectedQuestion);
    let userid = localStorage.getItem('USERID');
    this.selectedQuestion.userID=userid;
    let token = localStorage.getItem('token');
    const reqHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    let url=`http://103.44.53.3:8080/api/v1/auth/saveOneAnswer`;
    this.http.post(url,this.selectedQuestion,{headers:reqHeader}).subscribe(res=>{
      console.log(res);
    })


    if (this.questionCounter < this.totalQuestions.length - 1) {
      this.questionCounter++;
      this.selectedQuestion = this.totalQuestions[this.questionCounter];
      // console.log("next questtion", this.selectedQuestion)

    } else {
      this.toastr.error("No further Questions");
      this.router.navigateByUrl('/quizfinish');
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

  singleQuesRes(e:any){
    console.log(e.value);
    this.selectedQuestion.selected="1";
    this.selectedQuestion.selectedoptions=e.value;
    console.log(this.selectedQuestion);

    
    this.res_array.push(this.selectedQuestion);
    console.log(this.res_array);
  }

  radioChange(e: any) {
    console.log(e);

  }

}
