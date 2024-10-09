import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, concatMap, delay, exhaustMap, filter, map, mergeMap, Observable, of, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { ApiService } from '../api.service';
import { WORLD_CITIES } from '../app.constants';
import { Customer } from '../app.model';
import { randomNumberMinMax, shuffleArray } from '../utils';

export interface Word {
  startLetter: string;
  wordList: string;
}

export enum DemoEnum {
  CONCATMAP = 'concatMap',
  MERGEMAP = 'mergeMap',
  SWITCHMAP = 'switchMap',
  EXHAUSTMAP = 'exhaustMap'
}

@Injectable({
  providedIn: 'root'
})
export class HigherOrderMappingOperatorsService {

  private apiService: ApiService = inject(ApiService);

  allCustomers$: Observable<Customer[]> = this. apiService.allCustomers$;
  
  private characterSubject = new BehaviorSubject<string>('');
  public character$: Observable<string> = this.characterSubject.asObservable();

  private demoTypeSubject = new Subject<DemoEnum | null>();
  public demoType$: Observable<DemoEnum | null> = this.demoTypeSubject.asObservable();

  //#region concatMap
  private wordsArrayConcatMapSubject = new BehaviorSubject<Word[]>([]);
  public wordsArrayConcatMap$ = this.wordsArrayConcatMapSubject.asObservable();
  wordsStartingWithCharacterConcatMap$: Observable<Word[] | null> = this.characterSubject.pipe(
    concatMap(char => !!char ? this.getWordsStartingWith(char) : of(null)),
    withLatestFrom(this.wordsArrayConcatMap$),
    map(([currentWord, wordsArray]: [Word | null, Word[] | []]) => {
      if (!currentWord) return [];

      return [
        ...wordsArray,
        currentWord
      ];
    }),
    tap((newArr: Word[]) => this.wordsArrayConcatMapSubject.next(newArr))
  )
  //#endregion

  //#region mergeMap
  private wordsArrayMergeMapSubject = new BehaviorSubject<Word[]>([]);
  public wordsArrayMergeMap$ = this.wordsArrayMergeMapSubject.asObservable();
  wordsStartingWithCharacterMergeMap$: Observable<Word[] | null> = this.characterSubject.pipe(
    mergeMap(char => !!char ? this.getWordsStartingWith(char) : of(null)),
    withLatestFrom(this.wordsArrayMergeMap$),
    map(([currentWord, wordsArray]: [Word | null, Word[] | []]) => {
      if (!currentWord) return [];

      return [
        ...wordsArray,
        currentWord
      ];
    }),
    tap((newArr: Word[]) => this.wordsArrayMergeMapSubject.next(newArr))
  )
  //#endregion

  //#region switchMap
  private wordsArraySwitchMapSubject = new BehaviorSubject<Word[]>([]);
  public wordsArraySwitchMap$ = this.wordsArraySwitchMapSubject.asObservable();
  wordsStartingWithCharacterSwitchMap$: Observable<Word[] | null> = this.characterSubject.pipe(
    switchMap(char => !!char ? this.getWordsStartingWith(char) : of(null)),
    withLatestFrom(this.wordsArraySwitchMap$),
    map(([currentWord, wordsArray]: [Word | null, Word[] | []]) => {
      if (!currentWord) return [];

      return [
        ...wordsArray,
        currentWord
      ];
    }),
    tap((newArr: Word[]) => this.wordsArraySwitchMapSubject.next(newArr))
  )
  //#endregion  

  //#region exhaustMap
  private wordsArrayExhaustMapSubject = new BehaviorSubject<Word[]>([]);
  public wordsArrayExhaustMap$ = this.wordsArrayExhaustMapSubject.asObservable();
  wordsStartingWithCharacterExhaustMap$: Observable<Word[] | null> = this.characterSubject.pipe(
    exhaustMap(char => !!char ? this.getWordsStartingWith(char) : of(null)),
    withLatestFrom(this.wordsArrayExhaustMap$),
    map(([currentWord, wordsArray]: [Word | null, Word[] | []]) => {
      if (!currentWord) return [];

      return [
        ...wordsArray,
        currentWord
      ];
    }),
    tap((newArr: Word[]) => this.wordsArrayExhaustMapSubject.next(newArr))
  )
  //#endregion   

  getWordsStartingWith(char: string): Observable<Word> {
    const delayTime = randomNumberMinMax(1, 4) * 1000;
    return of(char).pipe(
      delay(delayTime),
      map(char => {
        const wordList = this.retrieveCitiesStartingWith(char);

        return {
          startLetter: char,
          wordList
        } as Word;
      })
    )
  }

  changeCharacter(character: string) {
    this.characterSubject.next(character);
  }

  changeDemoType(demo: DemoEnum) {
    this.demoTypeSubject.next(demo);
  }

  clear() {
    this.characterSubject.next('');
    this.demoTypeSubject.next(null);
    this.wordsArrayConcatMapSubject.next([]);
    this.wordsArrayMergeMapSubject.next([]);
    this.wordsArraySwitchMapSubject.next([]);
    this.wordsArrayExhaustMapSubject.next([]);
  }

  private retrieveCitiesStartingWith(char: string): string {
    const citiesStartingWith = WORLD_CITIES.filter(word => word.substring(0, 1).toLocaleLowerCase() === char.toLocaleLowerCase());
    const shuffledCities = shuffleArray(citiesStartingWith);
    const firstTenCities = shuffledCities.slice(0, 7);
    
    return firstTenCities.join(' | ')
  }

}