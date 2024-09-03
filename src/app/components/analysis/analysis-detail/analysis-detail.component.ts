import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Analysis, Horse, PredictionEnum } from '../../../../types';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AnalysisService } from '../../../services/analysis.service';
import { HorseDataComponent } from "../../horse-grid/horse-data/horse-data.component";
import { Subject } from 'rxjs';

@Component({
  selector: 'app-analysis-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    HorseDataComponent
  ],
  templateUrl: './analysis-detail.component.html',
  styleUrls: ['./analysis-detail.component.css'],
})
export class AnalysisDetailComponent implements OnInit {
  isEditingHorse = false;
  isEditingObservations = false;
  observationsForm: FormGroup;
  formatedDate: string = ''
  analysisData!: Analysis;
  horseImgUrl: string = ''
  originalHorseData: Horse | null = null;
  analysisImgUrl: string = '';
  dataSubject = new Subject<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder,
    private analysisService: AnalysisService
  ) {
    this.observationsForm = this.fb.group({
      observations: ['']
    })
  }
  ngOnInit(): void {
    this.analysisData = this.data.analysisData;
    this.horseImgUrl = this.data.horseImgUrl;
    this.analysisImgUrl = this.data.analysisImgUrl;
    this.observationsForm.patchValue({ observations: this.analysisData.observations });

    if (this.analysisData.horse) {
      this.originalHorseData = { ...this.analysisData.horse };
    }
  }

  getPredictionIcon(prediction: PredictionEnum): string {
    if (!prediction) return 'help';
    switch (prediction) {
      case PredictionEnum.INTERESADO:
        return 'sentiment_satisfied';
      case PredictionEnum.SERENO:
        return 'sentiment_neutral';
      case PredictionEnum.DISGUSTADO:
        return 'sentiment_dissatisfied';
      default:
        return 'help';
    }
  }

  toggleEditObservations(): void {
    if (this.isEditingObservations) {
      this.saveObservations();
    }
    this.isEditingObservations = !this.isEditingObservations;
  }

  saveObservations() {
    if (this.observationsForm.valid && this.observationsForm.value.observations !== this.analysisData.observations) {
      this.analysisData.observations = this.observationsForm.value.observations;
      this.editAnalysis()
    }
  }

  editAnalysis() {
    this.analysisService.editAnalysis(this.analysisData).subscribe({
      next: response => {
        console.log('Se editó el análsis', response);
        this.originalHorseData = this.analysisData.horse
        this.notifyRefresh();
      },
      error: error => {
        console.error('Error al editar el análisis', error)
      }
    });
  }

  notifyRefresh() {
    const resultData = { update: true };
    this.dataSubject.next(resultData);  // Emit data to subscribers
  }
}