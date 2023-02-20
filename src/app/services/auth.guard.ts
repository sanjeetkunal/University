import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router,private auth:AuthService) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    //console.log(route);
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    //extracting the authenticated value from authservice
    //console.log(this.auth.authenticated);
   
    return true;
    
    
  }
  
}
