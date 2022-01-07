import { Component, OnInit } from '@angular/core';
import { PlannedOperationService } from './services/planned-operation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'comptabox';

  constructor(private plannedOperationService: PlannedOperationService) {
  }

  ngOnInit(): void {
    this.plannedOperationService.performPlannedOperations();
  }

}
