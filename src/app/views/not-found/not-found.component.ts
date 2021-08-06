import { Component, OnInit } from '@angular/core';
import { SessaoService } from 'src/app/core/services/sessao.service';


@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private sessaoService: SessaoService) { }

  ngOnInit() {
    this.sessaoService.logout();
  }
}
