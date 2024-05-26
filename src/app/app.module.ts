import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppRoutingModule } from './app-routing.module';

import { NgxSpinnerModule } from 'ngx-spinner';
import { AppData } from './app-data';
import { AppComponent } from './app.component';
import { CatchErrorComponent } from './catch-error/catch-error.component';
import { CombineLatestComponent } from './combine-latest/combine-latest.component';
import { ConcatAllComponent } from './concat-all/concat-all.component';
import { ConcatMapComponent } from './concat-map/concat-map.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CourseWrapComponent } from './course-wrap-up/course-wrap-up.component';
import { CustomLoadingComponent } from './custom-loading/custom-loading.component';
import { CustomLogComponent } from './custom-log/custom-log.component';
import { CustomSortComponent } from './custom-sort/custom-sort.component';
import { DebounceTimeComponent } from './debounce-time/debounce-time.component';
import { DeferComponent } from './defer/defer.component';
import { DelayComponent } from './delay/delay.component';
import { DistinctUntilChangedComponent } from './distinct-until-changed/distinct-until-changed.component';
import { ExhaustMapComponent } from './exhaust-map/exhaust-map.component';
import { FilterComponent } from './filter/filter.component';
import { FinalizeComponent } from './finalize/finalize.component';
import { ForkJoinComponent } from './fork-join/fork-join.component';
import { FromComponent } from './from/from.component';
import { GroupByComponent } from './groupBy/group-by.component';
import { HigherOrderMappingOperatorsComponent } from './higher-order-mapping-operators/higher-order-mapping-operators.component';
import { HomeComponent } from './home/home.component';
import { HowToCreationOperatorComponent } from './how-to-creation-operator/how-to-creation-operator.component';
import { HowToPipeableOperatorComponent } from './how-to-pipeable-operator/how-to-pipeable-operator.component';
import { ImperativeComponent } from './imperative/imperative.component';
import { IntervalComponent } from './interval/interval.component';
import { LoadingComponent } from './loading/loading.component';
import { MapComponent } from './map/map.component';
import { MergeMapComponent } from './merge-map/merge-map.component';
import { MergeComponent } from './merge/merge.component';
import { ObservablesPrimerComponent } from './observables-primer/observables-primer.component';
import { OfComponent } from './of/of.component';
import { ReactivePatternsComponent } from './reactive-patterns/reactive-patterns.component';
import { ScanComponent } from './scan/scan.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { ShareReplayComponent } from './share-replay/share-replay.component';
import { ShareComponent } from './share/share.component';
import { SharedModule } from './shared/shared.module';
import { SubjectsContinuedComponent } from './subjects-continued/subjects-continued.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { SwitchMapComponent } from './swtich-map/switch-map.component';
import { TakeComponent } from './take/take.component';
import { TapComponent } from './tap/tap.component';
import { ToArrayComponent } from './to-array/to-array.component';
import { WithLatestFromComponent } from './with-latest-from/with-latest-from.component';
import { ZipComponent } from './zip/zip.component';
import { SlideViewerComponent } from './slide-viewer/slide-viewer.component';

@NgModule({
  declarations: [																									
    AppComponent,
    ObservablesPrimerComponent,
    ImperativeComponent,
    SubjectsComponent,
    SubjectsContinuedComponent,
    ReactivePatternsComponent,
    OfComponent,
    FromComponent,
    MapComponent,
    TapComponent,
    HowToCreationOperatorComponent,
    HowToPipeableOperatorComponent,
    CustomLogComponent,
    CustomSortComponent,
    FilterComponent,
    ConcatAllComponent,
    ToArrayComponent,
    TakeComponent,
    DelayComponent,
    ForkJoinComponent,
    CombineLatestComponent,
    ZipComponent,
    DebounceTimeComponent,
    HomeComponent,
    DistinctUntilChangedComponent,
    MergeComponent,
    WithLatestFromComponent,
    ShareReplayComponent,
    HigherOrderMappingOperatorsComponent,
    ConcatMapComponent,
    ShareComponent,
    MergeMapComponent,
    SwitchMapComponent,
    ExhaustMapComponent,
    CatchErrorComponent,
    LoadingComponent,
    FinalizeComponent,
    CustomLoadingComponent,
    CourseDetailsComponent,
    ScenariosComponent,
    DeferComponent,
    IntervalComponent,
    ScanComponent,
    GroupByComponent,
    CourseWrapComponent,
    SlideViewerComponent
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    InMemoryWebApiModule.forRoot(AppData, { delay: 0 }),
    AppRoutingModule,
    NgxSpinnerModule,
    SharedModule
  ],
  exports: [
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
