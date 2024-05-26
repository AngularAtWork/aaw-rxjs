import { Component, OnInit } from '@angular/core';

import { Observable, Observer, Subscriber, Subscription, TeardownLogic } from 'rxjs';

@Component({
  selector: 'app-observables-primer',
  templateUrl: './observables-primer.component.html',
  styleUrls: ['./observables-primer.component.scss']
})
export class ObservablesPrimerComponent implements OnInit {

  ngOnInit(): void {

    // HOT OBSERVABLE
    // PRODUCER OUTSIDE OBSERVABLE EXECUTION
    // PRODUCER'S VALUES ARE MULTICAST
    const randHot = Math.random();
    
    // OBSERVABLE (subscriber parameter is an OBSERVER)
    const observable$ = new Observable((subscriber) => {

      // COLD OBSERVABLE
      // PRODUCER INSIDE OBSERVABLE EXECUTION
      // PRODUCER'S VALUES ARE UNICAST
      const randCold = Math.random();

      subscriber.next(randHot);
      
      // ON-GOING PROCESS
      // const si = setInterval(() => {
      //   const generate = Math.random();

      //   console.log('\n', 'generator', '\n', generate);

      //   subscriber.next(generate)
      // }, 2000);

      // setTimeout(() => {
      //   subscriber.error('An error occurred.');
      // }, 10000);
      
      
      // NEXT - sends subscribers Next notification with value
      // subscriber.next(1);
      
      // COMPLETE - sends subscribers Complete notification
      // subscriber.complete();
      
      // ERROR - sends subscribers Error notification with an error object
      // subscriber.error('An error occurred!');

      // FINALIZATION (optional) - function that always gets called when:
      //   1. Complete method is called
      //   2. Error method is called
      //   3. A subscriber calls unsubscribe  
      return (() => {
        // STOPS THE ON-GOING PROCESS
        // clearInterval(si);
      }) as TeardownLogic;

    });

    // const subscription1 = observable$.subscribe({
    //   next: (value) => console.log('\n', 'subscriber1 received', '\n', value),
    //   error: (err: string) => console.log('\n','subscriber1 received an error notification with message', err),
    //   complete: () => console.log('\n','subscriber1 received a completion notification')
    // })

    // const subscription2 = observable$.subscribe({
    //   next: (value) => console.log('\n', 'subscriber2 received', '\n', value),
    //   error: (err: string) => console.log('\n','subscriber2 received an error notification with message', err),
    //   complete: () => console.log('\n','subscriber2 received a completion notification')
    // })

    // setTimeout(() => {
    //   console.log('\n', 'subscriber1 unsubscribing');
    //   subscription1.unsubscribe();
    // }, 10000);

  }
}
