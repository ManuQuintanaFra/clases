import { Component } from '@angular/core';
import { BookCard} from '../../shared/components/book-card/book-card';

@Component({
  selector: 'app-home',
  imports: [BookCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
