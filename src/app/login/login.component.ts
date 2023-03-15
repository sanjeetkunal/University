import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

//image capture functionality
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();
  sysImage = '';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private auth:AuthService,
    private router:Router) {

      window.addEventListener("blur", () => {
        // document.title = "Breakup";
        // console.log("tab changed")
       
      });
    
    window.addEventListener("focus", () => {
        //document.title = "Patch Up";
        
      });

    }

  ngOnInit(): void {
    this.auth.removesession();
  }

  loading: boolean = false;
  SubmitButtonText: string = "Login";
  loadinguser = false;

  async loginUser(logindata: any) {
    const { mobile, password } = logindata.value;
    if (mobile.trim() == "" || password.trim() == "") {
      this.toastr.warning("Please enter userid and password !");
      this.SubmitButtonText = "Login";
    } else {
         this.auth.loginService(logindata.value);
    }
  }

  public getSnapshot(): void {
    this.trigger.next(void 0);
  }
  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
    console.info('got webcam image', this.sysImage);
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

}
