import { inject } from "@angular/core";
import { defer, forkJoin, GroupedObservable, merge, Observable, of, OperatorFunction, zip } from "rxjs";
import { concatMap, finalize, groupBy, map, mergeAll, share, take, tap, timeInterval, toArray } from "rxjs/operators";
import { LoadingService } from "./loading.service";
import { TapCallback } from "./app.model";

export const randomNumberMinMax = (min: number, max: number): number => {
  // Generate random number, min and max inclusive
  const randMin = Math.ceil(min);
  const randMax = Math.floor(max);
  return Math.floor(Math.random() * (randMax - randMin + 1)) + randMin;
}

export const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const randomLetter = (upperCase = true): string => {
  const randomNumber = randomNumberMinMax(0, 25);
  const letters = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
  const letter =  letters[randomNumber];
  return upperCase ? letter : letter.toLocaleLowerCase();
};

export function addFullNameProperty(upperCase = false)  {
  return function<T extends { first: string, last: string }>(source: Observable<T>): Observable<T> {
    return source.pipe(
      map((sourceValue: any) => {
          const full = `${sourceValue.first} ${sourceValue.last}`;
          return { ...sourceValue, fullName: upperCase ? full.toLocaleUpperCase() : full };
      })
    )
  } 
}


// CUSTOM LOG OPERATOR
export function log(label = 'CUSTOM-LOG', callback = TapCallback.Next, bgColor = '#0000FF', collapseGroup = true) {
  const tColor = pickTextColorBasedOnBgColorAdvanced(bgColor, '#FFFFFF', '#000000');
  return function<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      tap({
        next: (result: T) => {
          if (callback === TapCallback.Next || callback === TapCallback.All) {
            collapseGroup && console.groupCollapsed(`%c${label}`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`);
            !collapseGroup && console.group(`%c${label}`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`);
            console.log(result);
            console.groupEnd();
          }
        },
        complete: () => {
          if (callback === TapCallback.Complete || callback === TapCallback.All) {
            console.log(`%c${label} COMPLETED (source)`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`)
          }
        },
        error: (err: any) => {
          if (callback === TapCallback.Error || callback === TapCallback.All) {
            console.log(`%c${label} ERRORED (source)`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`, err.message)
          }
        },
        subscribe: () => {
          if (callback === TapCallback.Subscribe || callback === TapCallback.All) {
            console.log(`%c${label} SUBSCRIBED (source)`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`)
          }
        },
        unsubscribe: () => {
          if (callback === TapCallback.Unsubscribe || callback === TapCallback.All) {
            console.log(`%c${label} UNSUBSCRIBED (source)`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`)
          }
        },
        finalize: () => {
          if (callback === TapCallback.Finalize || callback === TapCallback.All) {
            console.log(`%c${label} FINALIZED (source)`, `background: ${bgColor}; color: ${tColor}; font-size: 10px; font-weight: bold; padding: 3px; border-radius: 2px`)
          }
        },
      }),
    );
  }
}


// test observable completion
export function testCompletion<T>(testObs: Observable<T>): Observable<any> {
  return forkJoin([testObs]).pipe(map(() => true));
}

// CUSTOM SORT OPERATOR
export function sortObs<T>(key: keyof T, order: 'asc' | 'desc' = 'asc') {
  return function(source: Observable<T[]>): Observable<T[]> {
    return source.pipe(
      map((arrayOfObjects: T[]) => arrayOfObjects.sort(compareValues(key, order)))
    )
  }
}

export function updateOnce<T>(fn: Function): OperatorFunction<T, T> {
  return function(source: Observable<any>) {
    return defer(() => {
      let run = false;
      return source.pipe(
        tap(() => {
          if (!run) {
            fn();
            run = true;
          }
        })
      );
    });
  };
}

// function for comparing objects by given property
export function compareValues<T>(key: keyof T, order: 'asc' | 'desc' = 'asc') {
  return function<T>(a: any, b: any) {

    let varA!: any;
    let varB!: any;

    const possibleDateA = new Date(a[key]).toString();
    const possibleDateB = new Date(b[key]).toString();

    if (possibleDateA !== 'Invalid Date' && possibleDateB !== 'Invalid Date') {
      varA = new Date(a[key]);
      varB = new Date(b[key]);
    } else if (!isNaN(a[key]) && !isNaN(b[key])) {
      varA = +a[key];
      varB = +b[key];
    } else  {
      varA = a[key].toLocaleLowerCase();
      varB = b[key].toLocaleLowerCase();
    }

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (order === 'desc') ? (comparison * -1) : comparison;
  };
}

export function timeObservable<T>(obs$: Observable<T>, obsName = 'This observable'): Observable<T> {
  console.log(`$timeObservable function for ${obsName} invoked.`);
  return of(null).pipe(
    map(() => performance.now()),
    tap(() => console.log('timer starting')),
    concatMap((startTime: number) => obs$.pipe(map((obsValue: T) => ({ obsValue, startTime })))),
    map(result => {
        const endTime: number = performance.now();
        const timeDiff = Math.round((endTime - result.startTime) / 1000);
        console.log(`${obsName} took ${timeDiff} seconds to emit its first value`);
        return result.obsValue;
    }),
    take(1)
  );
}

// time elasped for observable finalizing
export const timeObservableFinalize = (label = 'This observable') => {
  const start = performance.now();
  return (source: Observable<any>): Observable<any> => {
    return source.pipe(
      finalize(() => {
        const end = performance.now();
        const timeDiff = (end - start) / 1000;
        console.log(`${label} took ${timeDiff}ms to finalize`);
      })
    )
  }
}

export const startLoader = (label = 'Starting loader...') => {
  const loadingService = inject(LoadingService);
  return (source: Observable<any>): Observable<any> => {
    return source.pipe(
      tap(() => console.log(label)),
      tap(() => loadingService.loadingOn())
    )
  }
}

export const stopLoader = (label = 'Stopped loader') => {
  const loadingService = inject(LoadingService);
  return (source: Observable<any>): Observable<any> => {
    return source.pipe(
      tap(() => loadingService.loadingOff()),
      tap(() => console.log(label)),
    )
  }
}


export function getAge(dateString: string) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}

export const getProperty = <T extends { [key: string]: any }>(property: string, obj: T): T | null => {
  const nestedProps = property.split('.');
  
  return nestedProps.reduce((newObj, prop) => {
      return (newObj && newObj[prop]) || null;
  }, obj);
}

export const hasProperty = <T extends { [key: string]: any }>(property: string, obj: T): boolean => {
  return !!getProperty(property, obj);
}

export const getPropertyEq = <T extends { [key: string]: any }>(property: string, nestedObj: T, value: any): T | null => {
  const nestedProps = property.split('.');
  
  return nestedProps.reduce((obj, key, currentIndex) => {
    if (currentIndex === nestedProps.length - 1) {
        if (obj && obj[key] !== 'undefined' && obj[key] !== '' && obj[key] === value) {
            return obj[key];
        }
        if (obj && obj[key] !== 'undefined' && obj[key] !== '' && Array.isArray(obj[key]) && obj[key].find((val: any) => val === value)) {
            return obj[key];
        }

        return null;
    }

    return obj[key];
  }, nestedObj);
}

export const isPropertyEq = <T extends { [key: string]: any }>(property: string, nestedObj: T, value: any): boolean => {
  return !!getPropertyEq(property, nestedObj, value);
}

export const getPropertyIncludes = <T extends { [key: string]: any }>(property: string, nestedObj: T, value: string): T | null => {
  const nestedProps = property.split('.');
  
  return nestedProps.reduce((obj, key, currentIndex) => {
    if (currentIndex === nestedProps.length - 1) {
        if (obj && obj[key] !== 'undefined' && typeof obj[key] === 'string' && obj[key] !== '' && obj[key].toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
            return obj[key];
        }
        
        return null;
    }

    return obj[key];
  }, nestedObj);
}

export const isPropertyIncludes = <T extends { [key: string]: any }>(property: string, nestedObj: T, value: string): boolean => {
  return !!getPropertyIncludes(property, nestedObj, value);
}

export const getPropertyBetween = <T extends { [key: string]: any }>(property: string, nestedObj: T, min: number, max: number): T | null => {
  const nestedProps = property.split('.');
  
  return nestedProps.reduce((obj, key, currentIndex) => {
    if (currentIndex === nestedProps.length - 1) {
        if (obj && obj[key] !== 'undefined' && typeof obj[key] === 'number' && obj[key] >= min && obj[key] <= max) {
            return obj[key];
        }
        
        return null;
    }

    return obj[key];
  }, nestedObj);
}

export const isPropertyBetween = <T extends { [key: string]: any }>(property: string, nestedObj: T, min: number, max: number): boolean => {
  return !!getPropertyBetween(property, nestedObj, min, max);
}

export const compareArrayOfIdProperties = <T extends {id: string}>(prev: T[], curr: T[]) => {
  return  prev.map(prevCust => prevCust.id).join(',') === curr.map(currCust => currCust.id).join(',')
}

export const titleCase = (words: string) => {
  return words.toLowerCase().split(" ").reduce( (s, c) =>
  s +""+(c.charAt(0).toUpperCase() + c.slice(1) +" "), '');
}

export const fuzzy = (searchString: string, searchText: string) => {
  let i = 0;
  let n = -1;
  let l;
  for (; l = searchText.toLowerCase()[i++] ;) if (!~(n = searchString.toLowerCase().indexOf(l, n + 1))) return false;
  return true;
}

export const goToTop = () => {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'auto'
  })
}

export const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }
  return newArray;
}

export const isHex = (hexValue: string) => /^#[0-9A-F]{6}$/i.test(hexValue);

export function pickTextColorBasedOnBgColorAdvanced(bgColor: string, lightColor: string, darkColor: string) {
  const bgHex = isHex(bgColor) ? bgColor : colorNameToHex(bgColor);
  const color = (bgHex.charAt(0) === '#') ? bgHex.substring(1, 7) : bgHex;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  const uicolors = [r / 255, g / 255, b / 255];
  const c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}

export const colorNameToHex = (colorName: string) => {
  let hexValue = '#000000';
  const lcColor = colorName.toLocaleLowerCase();
  const isGray = lcColor.includes('grey') || lcColor.includes('gray');

  const colorNames: { [key: string]: string} = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
  "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
  "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
  "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
  "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
  "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
  "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
  "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
  "honeydew":"#f0fff0","hotpink":"#ff69b4",
  "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
  "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
  "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
  "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
  "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
  "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
  "navajowhite":"#ffdead","navy":"#000080",
  "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
  "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
  "rebeccapurple":"#663399","red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
  "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
  "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
  "violet":"#ee82ee",
  "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
  "yellow":"#ffff00","yellowgreen":"#9acd32"};

  if (isGray) {
    const found: string = colorNames[lcColor.replace('gray', 'grey')] || colorNames[lcColor.replace('grey','gray')];
    if (found) {
      hexValue = found;
    }
  } else {
    const found: string = colorNames[lcColor];
    if (found) {
      hexValue = found;
    }
  }

  return hexValue;
}

export function createGroupedObjectsFromObservable(obsToGroup: Observable<any>, keySelectorFn: any): Observable<any> {
 return obsToGroup.pipe(
    groupBy(keySelectorFn),
    map((group$: GroupedObservable<any, any>) => zip(of(group$.key), group$.pipe(toArray()))),
    mergeAll(),
    map(([key, array]: [any, any[]]) => ({ groupKey: key, arrayOfValues: array})),
  )
}
