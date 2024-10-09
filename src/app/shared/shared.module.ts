import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerCardComponent } from './customer-card/customer-card.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import { CustomerTableWithActionsComponent } from './customer-table-with-actions/customer-table-with-actions.component';
import { CustomerCardWithActionsComponent } from './customer-card-with-actions/customer-card-with-actions.component';
import { CustomerTableSimpleComponent } from './customer-table simple/customer-table-simple.component';
import { ShowCardComponent } from './show-card/show-card.component';
import { JsonShowCardComponent } from './json-show-card/json-show-card.component';
import { LockKeypadComponent } from './lock-keypad/lock-keypad.component';
import { NumbersOnlyDirective } from './numbers-only.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CustomerCardComponent,
    CustomerCardWithActionsComponent,
    CustomerTableComponent,
    CustomerTableWithActionsComponent,
    CustomerTableSimpleComponent,
    ShowCardComponent,
    JsonShowCardComponent,
    LockKeypadComponent,
    NumbersOnlyDirective
  ],
  exports: [
    CommonModule,
    CustomerCardComponent,
    CustomerCardWithActionsComponent,
    CustomerTableComponent,
    CustomerTableWithActionsComponent,
    CustomerTableSimpleComponent,
    ShowCardComponent,
    JsonShowCardComponent,
    LockKeypadComponent,
    NumbersOnlyDirective
  ]
})
export class SharedModule { }
