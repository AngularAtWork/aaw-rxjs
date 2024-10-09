import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  imports: [
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: 'observables-primer', component: ObservablesPrimerComponent },
      { path: 'imperative', component: ImperativeComponent },
      { path: 'subjects', component: SubjectsComponent },
      { path: 'subjects-continued', component: SubjectsContinuedComponent },
      { path: 'reactive-patterns', component: ReactivePatternsComponent },
      { path: 'of', component: OfComponent },
      { path: 'from', component: FromComponent },
      { path: 'map', component: MapComponent },
      { path: 'tap', component: TapComponent },
      { path: 'how-to-creation-operator', component: HowToCreationOperatorComponent },
      { path: 'how-to-pipeable-operator', component: HowToPipeableOperatorComponent },
      { path: 'custom-log', component: CustomLogComponent },
      { path: 'custom-sort', component: CustomSortComponent },
      { path: 'filter', component: FilterComponent },
      { path: 'concat-all', component: ConcatAllComponent },
      { path: 'to-array', component: ToArrayComponent },
      { path: 'take', component: TakeComponent },
      { path: 'delay', component: DelayComponent },
      { path: 'fork-join', component: ForkJoinComponent },
      { path: 'combine-latest', component: CombineLatestComponent },
      { path: 'zip', component: ZipComponent },
      { path: 'debounce-time', component: DebounceTimeComponent },
      { path: 'distinct-until-changed', component: DistinctUntilChangedComponent },
      { path: 'merge', component: MergeComponent },
      { path: 'with-latest-from', component: WithLatestFromComponent },
      { path: 'share-replay', component: ShareReplayComponent },
      { path: 'higher-order-mapping-operators', component: HigherOrderMappingOperatorsComponent },
      { path: 'concat-map', component: ConcatMapComponent },
      { path: 'share', component: ShareComponent },
      { path: 'merge-map', component: MergeMapComponent },
      { path: 'switch-map', component: SwitchMapComponent },
      { path: 'exhaust-map', component: ExhaustMapComponent },
      { path: 'catch-error', component: CatchErrorComponent },
      { path: 'finalize', component: FinalizeComponent },
      { path: 'custom-loading', component: CustomLoadingComponent },
      { path: 'course-details', component: CourseDetailsComponent },
      { path: 'scenarios', component: ScenariosComponent },
      { path: 'defer', component: DeferComponent },
      { path: 'interval', component: IntervalComponent },
      { path: 'scan', component: ScanComponent },
      { path: 'group-by', component: GroupByComponent },
      { path: 'course-wrap-up', component: CourseWrapComponent },
      { path: 'slide-viewer', component: SlideViewerComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ])
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
