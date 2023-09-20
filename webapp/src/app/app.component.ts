import { Component } from '@angular/core';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'patent';
  results!: any;
  selectedProducts

  cols = [
    { field: 'patentNumber', header: 'patentNumber' },
    { field: 'appId', header: 'appId' },
    { field: 'assigneeName', header: 'assigneeName' },
    { field: 'assigneeAddr', header: 'assigneeAddr' },
    { field: 'inventorName', header: 'inventorName' },
    { field: 'inventorAddr', header: 'inventorAddr' }
];
  constructor(private appService: AppService) {
    this.getData();
  }

  getData() {
    this.appService.getData().subscribe((data) => {
      this.results = data
        .map((item: any) => {
          const docs =
            item.value.queryResults.searchResponse.response.docs || [];
          const docsData = docs.map((doc) => {
            const assignments = doc.assignments || [];
            const assignees = assignments
              .map((assignment) => {
                const assignees = assignment.assignee || [];
                const assigneeData = assignees.map((assignee) => {
                  return {
                    name: `${assignee.assigneeName}`,
                    address: `${assignee.cityName} ${assignee.countryCode} ${
                      assignee.streetLineOneText
                    } ${
                      (assignee.streetLineTwoText !== 'null' &&
                        assignee.streetLineTwoText) ||
                      ''
                    }`,
                  };
                });
                return assigneeData;
              })
              .flatMap((i) => i);
            const inventors = (doc.inventors || []).map((item) => {
              return {
                name: `${item.nameLineTwo} ${item.nameLineOne}`,
                address: `${item.city} ${item.geoCode} ${item.country}`,
              };
            });

            return {
              appId: doc.applId,
              assigneeName: assignees.map(item => item.name).join(' - '),
              assigneeAddr: assignees.map(item => item.address).join(' - '),
              inventorName: inventors.map(item => item.name).join(' - '),
              inventorAddr: inventors.map(item => item.address).join(' - '),
              patentNumber: item.key,
            };
          });

          return docsData.length ? docsData : [{ patentNumber: item.key, noneValue: true }];
        })
       
      this.results = this.results.flatMap(i => i).filter(item => !item.noneValue)

      console.log(this.results);
    });
  }

//   exportExcel() {
//     import('xlsx').then((xlsx) => {
//         const worksheet = xlsx.utils.json_to_sheet(this.products);
//         const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
//         const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
//         this.saveAsExcelFile(excelBuffer, 'products');
//     });
// }

exportCSV(dt) {
  dt.exportCSV()
}
}
