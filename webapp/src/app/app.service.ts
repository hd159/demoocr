import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { patentLists } from './patentData';
import { EMPTY, combineLatest, throwError } from 'rxjs';
import { catchError, delay, expand, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  results = [];
  patentids;
  constructor(private httpClient: HttpClient) {
    // this.patentids = patentLists.splice(0, 1000)
    this.patentids = [
      "11751504",
      "11751505",
      "11751506",
      "11751507",
      "11751508",
      "11751509",
      "11751510",
      "11751511",
      "11751512",
      "11751513",
      "11751514",
    ];
  }

  getPatentData(patentId) {
    let id = +patentId;
    if (Number.isNaN(id)) {
      const regex = /^([A-Za-z]+)(\d+)$/;
      const [, prefix, suffix] = patentId.match(regex);
      id = prefix + Number(suffix);
    }

    const payload = {
      df: 'patentTitle',
      facet: 'true',
      fl: '*',
      fq: [],
      mm: '0%',
      qf: 'appEarlyPubNumber applId appLocation appType appStatus_txt appConfrNumber appCustNumber appGrpArtNumber appCls appSubCls appEntityStatus_txt patentNumber patentTitle inventorName firstNamedApplicant appExamName appExamPrefrdName appAttrDockNumber appPCTNumber appIntlPubNumber wipoEarlyPubNumber pctAppType firstInventorFile appClsSubCls rankAndInventorsList',
      searchText: `patentNumber:(${id})`,
      sort: 'applId asc',
      start: '0',
    };

    return this.httpClient
      .post('/queries', payload, {
        headers: {
          'USPTO-API-KEY': 'HNX4TL254QeQGv22W9ZoRhhm8DlETCYz',
        },
      })
      .pipe(
        map((item: any) => ({
          key: Number.isNaN(+patentId) ? patentId : Number(patentId),
          value: item,
        }))
      );
  }

  getData() {
    const patentIds = this.patentids.splice(0, 60);
    const obs = patentIds.map((id) => this.getPatentData(id));

    return combineLatest(obs).pipe(
      // delay(10 * 1000),
      expand((res: any) => {
        if (this.patentids.length) {
          return this.getData();
        }
        return EMPTY;
      }),
      reduce((resultItems, currentRequestItems: any) => {
        return resultItems.concat(currentRequestItems);
      }, []),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
