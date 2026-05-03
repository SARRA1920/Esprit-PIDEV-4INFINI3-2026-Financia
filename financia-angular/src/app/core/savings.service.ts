import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { httpErrorMessage } from './http-error-message';
import {
  SavingsAccount,
  SavingsAccountActionRequest,
  SavingsAccountCreateRequest,
  SavingsAccountStatus,
  SavingsAccountUpdateRequest,
  GoalPredictionResult,
  SavingsGoal,
  SavingsGoalCreateRequest,
  SavingsGoalUpdateRequest,
  SavingsTransaction,
  SavingsTransactionCreateRequest,
  SavingsTransactionUpdateRequest,
} from '../models/savings.model';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/savings`;

  getMyAccounts(): Observable<SavingsAccount[]> {
    return this.listAccounts();
  }

  listAccounts(): Observable<SavingsAccount[]> {
    return this.http.get<SavingsAccount[]>(`${this.base}/accounts`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les comptes'))
    );
  }

  getAccount(id: number): Observable<SavingsAccount> {
    return this.http.get<SavingsAccount>(`${this.base}/accounts/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Compte introuvable'))
    );
  }

  createAccount(body: SavingsAccountCreateRequest): Observable<SavingsAccount> {
    return this.http.post<SavingsAccount>(`${this.base}/accounts`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de creer le compte'))
    );
  }

  updateAccount(id: number, body: SavingsAccountUpdateRequest): Observable<SavingsAccount> {
    return this.http.put<SavingsAccount>(`${this.base}/accounts/${id}`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de modifier le compte'))
    );
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/accounts/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de fermer le compte'))
    );
  }

  changeAccountStatus(id: number, status: SavingsAccountStatus): Observable<SavingsAccount> {
    return this.http.patch<SavingsAccount>(`${this.base}/accounts/${id}/status`, null, {
      params: { status },
    }).pipe(
      catchError((err) => this.handleError(err, 'Impossible de changer le statut du compte'))
    );
  }

  suspendAccount(id: number): Observable<SavingsAccount> {
    return this.http.patch<SavingsAccount>(`${this.base}/accounts/${id}/suspend`, null).pipe(
      catchError((err) => this.handleError(err, 'Impossible de suspendre le compte'))
    );
  }

  reactivateAccount(id: number): Observable<SavingsAccount> {
    return this.http.patch<SavingsAccount>(`${this.base}/accounts/${id}/reactivate`, null).pipe(
      catchError((err) => this.handleError(err, 'Impossible de reactiver le compte'))
    );
  }

  deposit(accountId: number, body: SavingsAccountActionRequest): Observable<SavingsAccount> {
    return this.http.post<SavingsAccount>(`${this.base}/accounts/${accountId}/deposit`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible d enregistrer le depot'))
    );
  }

  withdraw(accountId: number, body: SavingsAccountActionRequest): Observable<SavingsAccount> {
    return this.http.post<SavingsAccount>(`${this.base}/accounts/${accountId}/withdraw`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible d enregistrer le retrait'))
    );
  }

  getAccountStatistics(id: number): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.base}/accounts/${id}/statistics`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les statistiques'))
    );
  }

  getSystemStatistics(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.base}/accounts/system/statistics`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les statistiques globales'))
    );
  }

  generateReport(id: number): Observable<string> {
    return this.http.get(`${this.base}/accounts/${id}/report`, { responseType: 'text' }).pipe(
      catchError((err) => this.handleError(err, 'Impossible de generer le rapport'))
    );
  }

  /** Test Twilio SMS (backend envoie un message fixe au numero configure dans SavingsAccountController). */
  sendTestSms(): Observable<string> {
    return this.http.get(`${this.base}/accounts/test-sms`, { responseType: 'text' }).pipe(
      catchError((err) => this.handleError(err, 'Impossible d envoyer le SMS de test'))
    );
  }

  listGoals(): Observable<SavingsGoal[]> {
    return this.http.get<SavingsGoal[]>(`${this.base}/goals`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les objectifs'))
    );
  }

  getMyGoals(): Observable<SavingsGoal[]> {
    return this.listGoals();
  }

  getGoal(id: number): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.base}/goals/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Objectif introuvable'))
    );
  }

  createGoal(body: SavingsGoalCreateRequest): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${this.base}/goals`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de creer l objectif'))
    );
  }

  updateGoal(id: number, body: SavingsGoalUpdateRequest): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${this.base}/goals/${id}`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de modifier l objectif'))
    );
  }

  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/goals/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de supprimer l objectif'))
    );
  }

  forecastGoal(id: number): Observable<GoalPredictionResult> {
    return this.http.get<GoalPredictionResult>(`${this.base}/goals/${id}/forecast`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de lancer la prevision'))
    );
  }

  getAgentAdvice(id: number, body: Record<string, unknown> = {}): Observable<string> {
    return this.http.post(`${this.base}/goals/${id}/agent-advice`, body, { responseType: 'text' }).pipe(
      catchError((err) => this.handleError(err, 'Impossible de contacter le coach IA'))
    );
  }

  listTransactions(): Observable<SavingsTransaction[]> {
    return this.http.get<SavingsTransaction[]>(`${this.base}/transactions`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les transactions'))
    );
  }

  getTransaction(id: number): Observable<SavingsTransaction> {
    return this.http.get<SavingsTransaction>(`${this.base}/transactions/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Transaction introuvable'))
    );
  }

  listTransactionsByAccount(accountId: number): Observable<SavingsTransaction[]> {
    return this.http.get<SavingsTransaction[]>(`${this.base}/transactions/account/${accountId}`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les transactions du compte'))
    );
  }

  createTransaction(body: SavingsTransactionCreateRequest): Observable<SavingsTransaction> {
    return this.http.post<SavingsTransaction>(`${this.base}/transactions`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de creer la transaction'))
    );
  }

  updateTransaction(id: number, body: SavingsTransactionUpdateRequest): Observable<SavingsTransaction> {
    return this.http.put<SavingsTransaction>(`${this.base}/transactions/${id}`, body).pipe(
      catchError((err) => this.handleError(err, 'Impossible de modifier la transaction'))
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/transactions/${id}`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de supprimer la transaction'))
    );
  }

  listFlaggedTransactions(): Observable<SavingsTransaction[]> {
    return this.http.get<SavingsTransaction[]>(`${this.base}/transactions/flagged`).pipe(
      catchError((err) => this.handleError(err, 'Impossible de charger les transactions signalees'))
    );
  }

  private handleError(err: HttpErrorResponse, fallback: string) {
    return throwError(() => new Error(httpErrorMessage(err, fallback)));
  }
}
