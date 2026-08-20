import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './features/home/home';
import { Header } from '../app/layout/header/header';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('clase1');
}
