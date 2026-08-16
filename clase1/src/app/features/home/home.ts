import { Component } from '@angular/core';
import { BookCardComponent } from '../../shared/components/book-card/book-card';

@Component({
  selector: 'app-home',
  imports: [BookCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
