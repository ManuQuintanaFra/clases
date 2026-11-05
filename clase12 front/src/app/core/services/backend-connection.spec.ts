import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

describe('Conexión JWT con Nest', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  const perfil = {
    id: 'usuario-1',
    email: 'ana@example.com',
    nombre: 'Ana',
    apellido: 'Pérez',
    rol: 'user',
  };
  const token =
    'header.' +
    btoa(JSON.stringify({ sub: perfil.id, exp: Math.floor(Date.now() / 1000) + 3600 })) +
    '.signature';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    http.verify();
    auth.signOut();
  });

  it('inicia sesión, consulta el perfil con Bearer y guarda la sesión', () => {
    auth
      .signIn(perfil.email, 'clave-segura')
      .subscribe((sesion) => auth.iniciarSesion(sesion.access_token).subscribe());
    const request = http.expectOne(environment.apiUrl + '/auth/login');
    expect(request.request.body).toEqual({ email: perfil.email, password: 'clave-segura' });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ access_token: token, expires_in: 3600 });
    const me = http.expectOne(environment.apiUrl + '/auth/me');
    expect(me.request.headers.get('Authorization')).toBe('Bearer ' + token);
    me.flush(perfil);
    expect(auth.currentUser()).toEqual(perfil);
    expect(localStorage.getItem('biblioteca-token')).toBe(token);
  });

  it('restaura la sesión consultando al servidor y no filtra el token a otros dominios', () => {
    localStorage.setItem('biblioteca-token', token);
    auth.restaurarSesion().subscribe();
    http.expectOne(environment.apiUrl + '/auth/me').flush(perfil);
    TestBed.inject(HttpClient).get('https://example.com/imagen').subscribe();
    const externo = http.expectOne('https://example.com/imagen');
    expect(externo.request.headers.has('Authorization')).toBe(false);
    externo.flush({});
    expect(auth.currentUser()?.id).toBe(perfil.id);
  });

  it('descarta una sesión rechazada por el servidor', () => {
    localStorage.setItem('biblioteca-token', token);
    auth.restaurarSesion().subscribe();
    http
      .expectOne(environment.apiUrl + '/auth/me')
      .flush({ message: 'Token vencido' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.currentUser()).toBeNull();
    expect(auth.accessToken()).toBeNull();
    expect(localStorage.getItem('biblioteca-token')).toBeNull();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/login']);
  });

  it('envía nombre y apellido al registro y usa el token devuelto', () => {
    auth
      .signUp(perfil.email, 'clave-segura', perfil.nombre, perfil.apellido)
      .subscribe((sesion) => auth.iniciarSesion(sesion.access_token).subscribe());
    const request = http.expectOne(environment.apiUrl + '/auth/register');
    expect(request.request.body).toEqual({
      email: perfil.email,
      password: 'clave-segura',
      nombre: perfil.nombre,
      apellido: perfil.apellido,
    });
    request.flush({ access_token: token, expires_in: 3600 });
    http.expectOne(environment.apiUrl + '/auth/me').flush(perfil);
    expect(auth.currentUserData()?.nombre).toBe('Ana');
  });
});

