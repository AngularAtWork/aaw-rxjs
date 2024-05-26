import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slide-viewer',
  templateUrl: './slide-viewer.component.html',
  styleUrls: ['./slide-viewer.component.scss']
})
export class SlideViewerComponent implements OnInit {

  ngOnInit(): void {
    this.highlight();
  }

  highlight(evt: any = null) {

    const dataItem: string = evt ? evt.target.getAttribute('data-item') : 'imperative1';
    const slides = document.querySelectorAll('.slide');
    const imageViewer = document.querySelector('.slide-viewer');
    
    const selectedSlide = document.querySelector(`[data-item='${dataItem}']`);
    if (selectedSlide) {

      slides.forEach(slide => {
        slide.classList.remove('highlighted');
      })

      selectedSlide.classList.add('highlighted');

      if (imageViewer) {
        console.log(imageViewer.classList)
        imageViewer.classList.forEach(className => {
          if (className.startsWith('selected-image')) {
            console.log('found it')
            imageViewer.classList.remove(className);
          }
        })

        imageViewer.classList.add(`selected-image-${dataItem}`);
      }
    }
  }

}
