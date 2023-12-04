const config = require('../config/config');
const generalLib = require('./generalLib');

module.exports = {
    visaType: function({visaType=null,filters=null, data=null, portConfig=null, device=null}={}){
        // Sign For Replace
        const bq = '`';
        const ms = '$';
        const cll = '{';
        const clr = '}';
        
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Report Visa Type</title>
        </head>
        <style>
            @font-face {
                font-family: Khmer;
                src: url('${config.baseUrl}assets/fonts/khmer/Khmer-Regular.ttf');
            }

            @font-face {
                font-family: Moul;
                src: url('${config.baseUrl}assets/fonts/moul/Moul-Regular.ttf');
            }
        
            body {
                max-width: 920px;
                text-align: center;
                margin: 0 auto;
            }
        
            h2,
            h2,
            h3,
            h4,
            h5,
            h6,
            p,
            span {
                margin: 0;
                padding: 0;
            }
        
            main {
                max-width: 920px;
                background-color: #fff;
            }
        
            /* font family */
            .khmer {
                font-family: 'Khmer', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
        
            .moul {
                font-family: 'Moul', cursive;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }
        
            /* display */
            .d-flex {
                display: flex;
                flex-flow: row nowrap;
            }
        
            .items-start {
                align-items: start;
            }
        
            .items-center {
                align-items: center;
            }
        
            .justify-between {
                justify-content: space-between;
            }
        
            .justify-center {
                justify-content: center;
            }
        
            .justify-start {
                justify-content: center;
            }
        
            .flex-1 {
                flex: 1;
            }
        
            .flex-4 {
                flex: 4;
            }
        
            /* text color */
            .color-cyan {
                color: #0BACD5;
            }
        
            .color-cyan50 {
                color: #0BACD5;
                font-weight: 500;
            }
        
            /* text */
            .text-center {
                text-align: center;
            }
        
            .text-start {
                text-align: start;
            }
        
            .text-end {
                text-align: end;
            }
        
        
            /* padding */
            .p-8 {
                padding: 8px;
            }
        
            .p-10 {
                padding: 10px;
            }
        
            .p-20 {
                padding: 20px;
            }
        
            /* margin */
            .mb-8 {
                margin-bottom: 8px;
            }
        
        
            /* font size */
            .fs-8 {
                font-size: 0.8rem;
            }
        
            .fs-9 {
                font-size: 0.9rem;
            }
        
            .fs-10 {
                font-size: 1rem;
            }
        
            .fs-11 {
                font-size: 1.1rem;
            }
        
            .fs-12 {
                font-size: 1.2rem;
            }
        
            .fs-15 {
                font-size: 1.5rem;
            }
        
            /* font style */
            .italic {
                font-style: italic;
            }
        
            .underline {
                text-decoration: underline;
            }
        
            /* font weight */
            .fw-40 {
                font-weight: 400;
            }
        
            .fw-50 {
                font-weight: 500;
            }
        
            .fw-60 {
                font-weight: 600;
            }
        </style>
        
        <body>
            <main class="p-10">
                <!-- header -->
                <header class="d-flex items-start justify-between">
                    <div class="text-center">
                        <h4 class="moul color-cyan50 fs-10">នាយកដ្ធានជនបរទេស</h4>
                        <h4 class="moul color-cyan50 fs-10">មិនមែនអន្តោប្រវេសន្តនិងបច្ចេកវិទ្យា</h4>
                        <p class="khmer color-cyan fs-10">ការិយាល័យ ផ្តល់ទិដ្ឋាការ</p>
                        <p id="header1" class="khmer color-cyan fs-10"></p>
                        <img width="80px" src="${config.baseUrl}assets/header-style.png" />
                    </div>
                    <div>
                        <div class="text-center">
                            <h4 class="moul color-cyan50 fs-11">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                            <h4 class="moul color-cyan50 fs-11">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                            <img width="100px" src="${config.baseUrl}assets/header-style.png" />
                        </div>
                    </div>
                </header>
        
                <!-- welcome -->
                <div class="text-center">
                    <h4 class="moul fw-50 underline fs-10">គោរពជូន</h4>
                    <h4 id="status-1" class="khmer fs-9">Text ...</h4>
                </div>
        
                <!-- body -->
                <div class="d-flex items-start justify-start">
                    <div class="flex-1">
                        <h4 class="moul fw-50 underline fs-10">កម្មវត្តុៈ</h4>
                    </div>
                    <div class="flex-4">
        
                        <!-- status date -->
                        <p id="status-date" class="text-start khmer fs-9"></p>
        
                        <h4 class="text-start moul fw-50 underline fs-9 mb-8">ក. ប្រភេទទិដ្ឋាការបង់អាករ</h4>
                        <!-- visa 1 -->
                        <div id="visa-1"></div>
        
                        <h4 class="text-start moul fw-50 underline fs-9 mb-8">ខ. ប្រភេទទិដ្ឋាការមិនបង់អាករ</h4>
                        <!-- visa 2 -->
                        <div id="visa-2"></div>
        
                        <div class="d-flex mb-8">
                            <p class="text-end moul fw-50 fs-9" style="width: 360px;">សរុបភ្ញៀវចំនួន</p>
                            <p style="width: 30px;"></p>
                            <p id="total" class="text-center khmer fw-50 fs-9" style="width: 100px;">0</p>
                            <p class="text-start khmer fw-50 fs-9" style="width: 80px;">នាក់</p>
                        </div>
        
                        <div class="d-flex items-center justify-between">
                            <h4 class="text-start moul fw-50 underline fs-9 mb-8">គ. ចំណុចគួរអោយកត់សំគាល់ៈ</h4>
                            <h4 id="status-2" class="khmer fs-9" style="width: 300px;">Text ...</h4>
                        </div>
                        <p class="text-start khmer fs-9" style="width: 485px;">អាស្រ័យហេតុនេះសូម មេត្តា ពិនិត្យ និង ជ្រាបជា
                            របាយការណ៍ដ៏ខ្ពង់ខ្ពស់ ។</p>
                        <p class="khmer fs-9" style="width: 440px;">សូម មេត្តាទទួលនូវការគោរពដ៏ខ្ពង់ខ្ពស់ អំពីយើងខ្ញុំ ។</p>
        
                        <div class="d-flex items-start justify-between">
                            <h4></h4>
                            <div>
                                <h4 id="status-3" class="khmer fs-9" style="width: 300px;">Text ...</h4>
                                <p id="last-date" class="khmer fs-10"></p>
                                <h4 class="moul fw-50 fs-10">ប្រធានក្រុមផ្តល់ទិដ្ឋាការ</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <script>
                var statusDate = document.querySelector("#status-date");
                var visaType1 = document.querySelector("#visa-1");
                var visaType2 = document.querySelector("#visa-2");
                var status1 = document.querySelector("#status-1");
                var status2 = document.querySelector("#status-2");
                var status3 = document.querySelector("#status-3");
                var lastDate = document.querySelector("#last-date");
                var total = document.querySelector("#total");
                var header1 = document.querySelector("#header1");

                const startDataString = '${filters.start_date ? filters.start_date : generalLib.date()}'
                const endDataString = '${filters.end_date ? filters.end_date : generalLib.date()}'
        
                const start = new Date(${bq}${ms}${cll}startDataString${clr}${bq});
                const end = new Date(${bq}${ms}${cll}endDataString${clr}${bq});
        
                var startDate = ${bq}${ms}${cll}start.getDate()${clr}-${ms}${cll}start.getMonth()+1${clr}-${ms}${cll}start.getFullYear()${clr}${bq};
                var endDate = ${bq}${ms}${cll}end.getDate()${clr}-${ms}${cll}end.getMonth()+1${clr}-${ms}${cll}end.getFullYear()${clr}${bq};

                
                var port = ${portConfig}
                var device = ${device}
                var device_port = device['port']

                var dataVisa = ${JSON.stringify(visaType)} 
                var visaList = ${JSON.stringify(data)}
                var dataList = visaList["data"];
                dataVisa.sort(function (a, b) { return a.sort_reports - b.sort_reports });
        
                var noPrice = [];
                var price = [];
                dataVisa.forEach(val => {
                    if (val["price"] != 0) {
                        price.push(val);
                    } else {
                        noPrice.push(val);
                    }
                });

                statusDate.innerHTML = ${bq}
                ស្តីពីចំនួនភ្ញៀវបរទេស ដែលបានមកសុំទិដ្ឋាការចូលព្រះរាជាណាចក្រកម្ពុជា 
                            នៅអាកាសយាន្តដ្ធាន ${ms}${cll}port["${filters.port}"]["title"]${clr} ចាប់ពីថ្ងៃទី ${ms}${cll}startDate${clr}
                            ដល់ថ្ងៃទី ${ms}${cll}endDate${clr} ។${bq};
                header1.innerHTML =  ${bq}ក្រុមផ្តល់ទិដ្ឋាការ ប្រចាំ អ.ក ${ms}${cll}port["${filters.port}"]["title"]${clr}${bq};
                status1.innerHTML = ${bq}${ms}${cll}visaList.status1${clr}${bq};
                status2.innerHTML = ${bq}${ms}${cll}visaList.status2${clr}${bq};
                status3.innerHTML = ${bq}${ms}${cll}visaList.status3${clr}${bq};
                total.innerHTML = ${bq}${ms}${cll}visaList["total"]??0${clr}${bq};
        
                lastDate.innerHTML = ${bq}
                ${ms}${cll}port[device_port]["status"]}${ms}${cll}port[device_port]["title"]} ថ្ងៃទី ${ms}${cll}end.getDate()} ខែ ${ms}${cll}end.getMonth()+1} ឆ្នាំ ${ms}${cll}end.getFullYear()${clr}
                ${bq};
        
                price.forEach((value, i) => {
                    visaType1.innerHTML += ${bq}
                        <div class="d-flex mb-8">
                            <p class="text-start khmer fw-60 fs-9" style="width: 250px;">${ms}${cll}i + 1}. ${ms}${cll}value["label"]${clr}</p>
                            <p class="text-center khmer fw-60 fs-9" style="width: 60px;">${ms}${cll}value["type"]}</p>
                            <p class="text-start khmer fw-50 fs-9" style="width: 80px;">ចំនួន =</p>
                            <p class="text-center khmer fw-50 fs-9" style="width: 100px;">${ms}${cll}dataList[value["type"]] ?? 0${clr}</p>
                            <p class="text-start khmer fw-50 fs-9" style="width: 80px;">នាក់</p>
                        </div>
                        ${bq};
                    ${clr});
        
                noPrice.forEach((value, i) => {
                    visaType2.innerHTML += ${bq}
                        <div class="d-flex mb-8">
                            <p class="text-start khmer fw-60 fs-9" style="width: 250px;">${ms}${cll}i + 1}. ${ms}${cll}value["label"]${clr}</p>
                            <p class="text-center khmer fw-60 fs-9" style="width: 60px;">${ms}${cll}value["type"]}</p>
                            <p class="text-start khmer fw-50 fs-9" style="width: 80px;">ចំនួន =</p>
                            <p class="text-center khmer fw-50 fs-9" style="width: 100px;">${ms}${cll}dataList[value["type"]] ?? 0${clr}</p>
                            <p class="text-start khmer fw-50 fs-9" style="width: 80px;">នាក់</p>
                        </div>
                        ${bq};
                    ${clr});
            </script>
        </body>
        </html>
        `
        return  html
    },
    visaDate: function({visaType=null,filters=null, data=null, portConfig=null, device=null}={}){
        // Sign For Replace
        const bq = '`';
        const ms = '$';
        const cll = '{';
        const clr = '}';

        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visa Date</title>
            <link rel="stylesheet" href="style.css" />
        </head>

        <style>
            @font-face {
                font-family: Khmer;
                src: url('${config.baseUrl}assets/fonts/khmer/Khmer-Regular.ttf');
            }

            @font-face {
                font-family: Moul;
                src: url('${config.baseUrl}assets/fonts/moul/Moul-Regular.ttf');
            }

            body {
                max-width: 920px;
                text-align: center;
                margin: 0 auto;
                background-color: #fff;
                font-family: sans-serif, 'Segoe UI', Tahoma, Geneva, Verdana;
                font-size: 1rem;
            }

            h2,
            h2,
            h3,
            h4,
            h5,
            h6,
            p,
            span {
                margin: 0;
                padding: 0;
            }

            main {
                max-width: 920px;
                background-color: #fff;
            }

            table,
            th,
            td {
                border: 0.1px solid #eee;
                border-collapse: collapse;
                font-size: 0.90rem;
            }

            td {
                padding: 6px 0;
            }

            /* font family */
            .khmer {
                font-family: 'Khmer', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }

            .moul {
                font-family: 'Moul', cursive;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }

            .w-50 {
                min-width: 45px;
                max-width: 50px;
                word-wrap: break-word;
            }
        </style>

        <body>

            <main style="padding: 10px;">

                <!-- header -->
                <header style="display: flex; align-items: start; justify-content: space-between;">
                    <div class="text-center">
                        <h4 class="moul" style="color: #0BACD5; font-weight: 500;">នាយកដ្ធានជនបរទេស</h4>
                        <h4 class="moul" style="color: #0BACD5; font-weight: 500;">មិនមែនអន្តោប្រវេសន្តនិងបច្ចេកវិទ្យា</h4>
                        <p class="khmer" style="color: #0BACD5;">ការិយាល័យ ផ្តល់ទិដ្ឋាការ</p>
                        <p id="header1" class="khmer" style="color: #0BACD5;"></p>
                        <img width="80px" src="${config.baseUrl}assets/header-style.png" />
                    </div>
                    <div>
                        <div class="text-center">
                            <h4 class="moul" style="color: #0BACD5; font-weight: 500; font-size: 1.1rem;">ព្រះរាជាណាចក្រកម្ពុជា
                            </h4>
                            <h4 class="moul" style="color: #0BACD5; font-weight: 500; font-size: 1.1rem;">ជាតិ សាសនា
                                ព្រះមហាក្សត្រ</h4>
                            <img width="100px" src="${config.baseUrl}assets/header-style.png" />
                        </div>
                    </div>
                </header>

                <!-- welcome -->
                <div class="text-center" style="margin-bottom: 8px;">
                    <h4 id="first-date" class="khmer"></h4>
                </div>

                <!-- body -->
                <table style="width: 100%;">
                    <thead>
                        <tr class="khmer" style="background: #00c2ff;">
                            <td rowspan="2">
                                <p style="width: 45px; font-weight: 600; font-size: 14px;">ថ្ងៃ</p>
                            </td>
                            <td colspan="13">
                                <p style="font-weight: 600; font-size: 14px;">ប្រភេទទិដ្ឋាការ</p>
                            </td>
                            <td rowspan="2">
                                <p style="font-weight: 600; font-size: 14px; width: 60px;">សរុប</p>
                            </td>
                        </tr>

                        <!-- list visa type -->
                        <tr id="visa-type" class="khmer"></tr>
                    </thead>

                    <tbody id="tbody"></tbody>
                </table>

                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4></h4>
                    <div>
                        <h4 id="status" class="khmer" style="width: 300px; margin-top: 8px;"></h4>
                        <p id="last-date" class="khmer"></p>
                        <h4 class="moul" style="font-weight: 500;">ប្រធានក្រុមផ្តល់ទិដ្ឋាការ</h4>
                    </div>
                </div>
            </main>
            <script>

                var port = ${portConfig}
                var device = ${device}
                var device_port = device['port']

                console.log(device_port)
 
                var date = document.querySelector("#first-date");
                var state = document.querySelector("#status");
                var lastDate = document.querySelector("#last-date");
                var visaType = document.querySelector("#visa-type");
                var tBody = document.querySelector("#tbody");
                var header1 = document.querySelector("#header1");
                const date_filters = '${filters && filters.date ? filters.date : generalLib.date()}'
                const end = new Date(${bq}${ms}${cll}date_filters${clr}${bq}), y = end.getFullYear(), m = end.getMonth();
                
                var lastDay = new Date(y, m + 1, 0);

                var allVisaType =  ${JSON.stringify(visaType)} 
                var visaDate =  ${JSON.stringify(data)}

                var dataVisa = allVisaType
                var dataVisaDate = visaDate["data"]

                var totals = {};
                dataVisa.sort(function (a, b) { return a.sort_reports - b.sort_reports });

                date.innerHTML = ${bq}របាយការណ៌ប្រចាំខែ ${ms}${cll}end.getMonth() + 1${clr} ឆ្នាំ ${ms}${cll}end.getFullYear()${clr}${bq};
                state.innerHTML = ${bq}${ms}${cll}visaDate.status1${clr}${bq};
                lastDate.innerHTML = ${bq}${ms}${cll}port[device_port]["status"]}${ms}${cll}port[device_port]["title"]} ថ្ងៃទី ${ms}${cll}lastDay.getDate()} ខែ ${ms}${cll}end.getMonth() + 1} ឆ្នាំ  ${ms}${cll}end.getFullYear()${clr}${bq};                
                header1.innerHTML =  ${bq}ក្រុមផ្តល់ទិដ្ឋាការ ប្រចាំ អ.ក ${ms}${cll}port["${filters.port}"]["title"]${clr}${bq};
                dataVisa.forEach((val, i) => {
                    visaType.innerHTML += ${bq}
                        <td style="background: #e1ebf5; border: 1px solid #fff; font-weight: 500;">
                            <p class="w-50">${ms}${cll}val["type"]${clr}</p>
                        </td>
                    ${bq};
                });

                var dd = lastDay.getDate();
                var mm = (end.getMonth() + 1) < 10 ? ${bq}0${ms}${cll}end.getMonth() + 1${clr}${bq} : end.getMonth() + 1;
                var yy = end.getFullYear();

                console.log(mm);

                // push body //
                for (let i = 1; i <= dd; i++) {
                    var str = '', str2 = '', str3 = '';
                    var decRes = dataVisaDate[${bq}${ms}${cll}yy${clr}-${ms}${cll}mm${clr}-${ms}${cll}i < 10 ? ${bq}0${ms}${cll}i${clr}${bq}: i${clr}${bq}];
                    str = ${bq}<tr>
                        <td><p class="w-50">${ms}${cll}i${clr}</p></td>${bq};
                    dataVisa.forEach((val, i) => {
                        str2 += ${bq}<td><p class="w-50">${ms}${cll}decRes != null ? ${bq}${ms}${cll}decRes["data"][val["type"]] ?? 0${clr}${bq} : 0${clr}</p></td>${bq};
                        
                        let n = parseInt(decRes != null && decRes["data"][val["type"]] != null ? decRes["data"][val["type"]].toString() : "0");
                        // prepare total by types
                        if(totals[val["type"]] == null) totals[val["type"]] = 0;
                        totals[val["type"]] += n;
                    });
                    str3 = ${bq}<td style="max-width: 60px; word-wrap: break-word; background: #e1ebf5; border: 1px solid #fff;">
                            <p>${ms}${cll}decRes != null ? ${bq}${ms}${cll}decRes["total"]${clr}${bq} : 0${clr}</p>
                        </td>
                    </tr>${bq};
                    tBody.innerHTML += str + str2 + str3;
                }
                // push footer //
                var str = '', str2 = ''; str3 = '';
                str = ${bq}<tr>
                    <td style="background: #00c2ff;">
                        <p class="w-50 khmer" style="font-weight: 600; font-size: 14px;">សរុប</p>
                    </td>${bq};
                dataVisa.forEach((val, i) => {
                    str2 += ${bq}<td style="background: #e1ebf5; border: 1px solid #fff;">
                        <p class="w-50">${ms}${cll}totals[val["type"]]${clr}</p>
                    </td>${bq};
                });
                str3 = ${bq}<td style="background: #00c2ff; max-width: 60px; word-wrap: break-word;">
                        <p>${ms}${cll}visaDate["total"]??0${clr}</p>
                    </td>
                </tr>${bq};
                tBody.innerHTML += str + str2 + str3;
            </script>
        </body>
        </html>  
        `
        return html
    },
    visaCounty: function({visaType=null, allCountry=null, filters=null, data=null, portConfig=null, device=null}={}){
        // Sign For Replace
        const bq = '`';
        const ms = '$';
        const cll = '{';
        const clr = '}';
        
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visa Date</title>
            <link rel="stylesheet" href="style.css" />
        </head>

        <style>
            @font-face {
                font-family: Khmer;
                src: url('${config.baseUrl}assets/fonts/khmer/Khmer-Regular.ttf');
            }

            @font-face {
                font-family: Moul;
                src: url('${config.baseUrl}assets/fonts/moul/Moul-Regular.ttf');
            }

            body {
                max-width: 920px;
                text-align: center;
                margin: 0 auto;
                background-color: #fff;
                font-family: sans-serif, 'Segoe UI', Tahoma, Geneva, Verdana;
                font-size: 1rem;
            }

            h2,
            h2,
            h3,
            h4,
            h5,
            h6,
            p,
            span {
                margin: 0;
                padding: 0;
            }

            main {
                max-width: 920px;
                background-color: #fff;
            }

            table,
            th,
            td {
                border: 0.1px solid #eee;
                border-collapse: collapse;
                font-size: 0.90rem;
            }

            td {
                padding: 6px 0;
            }

            /* font family */
            .khmer {
                font-family: 'Khmer', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }

            .moul {
                font-family: 'Moul', cursive;
                line-height: 1.6;
                margin: 0;
                padding: 0;
            }

            .w-40 {
                min-width: 35px;
                max-width: 39px;
                word-wrap: break-word;
            }

            .w-60 {
                min-width: 55px;
                max-width: 60px;
                word-wrap: break-word;
            }

            .w-185 {
                min-width: 160px;
                max-width: 185px;
                word-wrap: break-word;
            }
        </style>

        <body>

            <main style="padding: 10px;">

                <!-- header -->
                <header style="display: flex; align-items: start; justify-content: space-between;">
                    <div class="text-center">
                        <h4 class="moul" style="color: #0BACD5; font-weight: 500;">នាយកដ្ធានជនបរទេស</h4>
                        <h4 class="moul" style="color: #0BACD5; font-weight: 500;">មិនមែនអន្តោប្រវេសន្តនិងបច្ចេកវិទ្យា</h4>
                        <p class="khmer" style="color: #0BACD5; ">ការិយាល័យ ផ្តល់ទិដ្ឋាការ</p>
                        <p id="header1" class="khmer" style="color: #0BACD5;"></p>
                        <img width="80px" src="${config.baseUrl}assets/header-style.png" />
                    </div>
                    <div>
                        <div class="text-center">
                            <h4 class="moul" style="color: #0BACD5; font-weight: 500; font-size: 1.1rem;">ព្រះរាជាណាចក្រកម្ពុជា
                            </h4>
                            <h4 class="moul" style="color: #0BACD5; font-weight: 500; font-size: 1.1rem;">ជាតិ សាសនា
                                ព្រះមហាក្សត្រ</h4>
                                <img width="100px" src="${config.baseUrl}assets/header-style.png" />
                        </div>
                    </div>
                </header>

                <!-- welcome -->
                <div class="text-center" style="margin-bottom: 8px;">
                    <h4 class="moul" style="font-weight: 500;">ស្ថិតិសញ្ជាតិ</h4>
                    <h4 id="statistic-date" class="moul" style="font-weight: 500;"></h4>
                    <h4 id="status1" class="khmer"></h4>
                </div>

                <!-- body -->
                <table style="width: 100%;">
                    <thead>
                        <tr id="thead" class="khmer" style="background: #00c2ff;"></tr>
                    </thead>

                    <tbody id="tbody"></tbody>
                </table>

                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h4></h4>
                    <div>
                        <h4 id="status2" class="khmer" style="width: 300px; margin-top: 8px;"></h4>
                        <p id="last-date" class="khmer"></p>
                        <h4 class="moul" style="font-weight: 500;">ប្រធានក្រុមផ្តល់ទិដ្ឋាការ</h4>
                    </div>
                </div>
            </main>

            <script>

                var statisticDate = document.querySelector('#statistic-date');
                var status1 = document.querySelector('#status1');
                var status2 = document.querySelector('#status2');
                var lastDate = document.querySelector('#last-date');
                var thead = document.querySelector('#thead');
                var tbody = document.querySelector('#tbody');
                var header1 = document.querySelector("#header1");
                var port = ${portConfig}
                var device = ${device}
                var device_port = device['port']


                var start = new Date('${filters.start_date ? filters.start_date : generalLib.date()}');
                var end  = new Date('${filters.end_date ? filters.end_date : generalLib.date()}');

                var allVisaType =  ${JSON.stringify(visaType)} 
                var listCountry =  ${JSON.stringify(data)}
                var allCountry =  ${JSON.stringify(allCountry)} 

                var dataVisa = allVisaType;
                var dataCountry = allCountry;
                var dataListCountry = listCountry["data"];
                
                var totals = {};
                dataVisa.sort(function (a, b) { return a.sort_reports - b.sort_reports });

                statisticDate.innerHTML = ${bq}
                ចាប់ពីថ្ងៃទី 
                        <span class="khmer">${ms}${cll}start.getDate()${clr}-${ms}${cll}start.getMonth() + 1${clr}-${ms}${cll}start.getFullYear()${clr}</span>
                        ដល់ថ្ងៃទី 
                        <span class="khmer">${ms}${cll}end.getDate()${clr}-${ms}${cll}end.getMonth() + 1${clr}-${ms}${cll}end.getFullYear()${clr}</span>
                ${bq};
                status1.innerHTML = ${bq}${ms}${cll}listCountry.status1${clr}${bq};
                status2.innerHTML = ${bq}${ms}${cll}listCountry.status2${clr}${bq};
                header1.innerHTML =  ${bq}ក្រុមផ្តល់ទិដ្ឋាការ ប្រចាំ អ.ក ${ms}${cll}port["${filters.port}"]["title"]${clr}${bq};
                lastDate.innerHTML = ${bq}${ms}${cll}port[device_port]["status"]}${ms}${cll}port[device_port]["title"]} ថ្ងៃទី ${ms}${cll}end.getDate()${clr} ខែ ${ms}${cll}end.getMonth() + 1${clr} ឆ្នាំ ${ms}${cll}end.getFullYear()${clr}${bq};
                // heading of table //
                var str = ''; var str2 = ''; var str3;
                str = ${bq}
                    <td class="w-40">
                        <p style="font-weight: 600; font-size: 13px;">ល.រ</p>
                    </td>
                    <td class="w-185">
                        <p style="font-weight: 600; font-size: 13px;">ឈ្មោះប្រទេស</p>
                    </td>
                ${bq};
                dataVisa.forEach((value, i) => {
                    str2 += ${bq}
                        <td class="w-40">
                            <p style="font-weight: 500; font-size: 13px;">${ms}${cll}value["type"]${clr}</p>
                        </td>
                    ${bq};
                });
                str3 = ${bq}
                    <td class="w-60">
                        <p style="font-weight: 600; font-size: 13px;">សរុប</p>
                    </td>
                ${bq};
                thead.innerHTML += str + str2 + str3;

                let index = 0;
                // body of table //
                dataCountry.forEach((value, i) => {
                    if (dataListCountry[value["code"]] != null) {
                        index++;
                        var str = ''; var str2 = ''; var str3;
                        var decRes = dataListCountry[value["code"]];
                        console.log(decRes);

                        str = ${bq}
                        <tr>
                            <td class="w-40">
                                <p style="font-weight: 500; font-size: 13px;">${ms}${cll}index${clr}</p>
                            </td>
                            <td class="w-185">
                                <p style="
                                    font-weight: 500; 
                                    font-size: 13px;
                                    overflow: hidden;
                                    display: -webkit-box;
                                    -webkit-line-clamp: 2;
                                    -webkit-box-orient: vertical;
                                ">${ms}${cll}value["name"]${clr} (${ms}${cll}value["code"]${clr})</p>
                            </td>
                        ${bq};
                        dataVisa.forEach((val, i) => {
                            str2 += ${bq}
                                <td class="w-40">
                                    <p style="font-weight: 500; font-size: 13px;">
                                    ${ms}${cll}decRes!=null?${bq}${ms}${cll}decRes["data"][val["type"]]??0${clr}${bq}:0${clr}
                                    </p>
                                </td>
                            ${bq};

                            let n = parseInt(decRes != null && decRes["data"][val["type"]] != null ? decRes["data"][val["type"]].toString() : "0");
                            // prepare total by types
                            if(totals[val["type"]] == null) totals[val["type"]] = 0;
                            totals[val["type"]] += n;
                        });
                        str3 = ${bq}
                            <td class="w-60" style="background-color: #e1ebf5;">
                                <p style="font-weight: 500; font-size: 13px;">${ms}${cll}decRes["total"]??0${clr}</p>
                            </td>
                        </tr>
                        ${bq};
                        tbody.innerHTML += str + str2 + str3;
                    }
                });
                // footer of table //
                var fstr = ''; var fstr2 = ''; var fstr3;
                fstr = ${bq}
                <tr>
                    <td class="w-40 khmer" style="background-color: #00c2ff;" colspan="2">
                        <p style="font-weight: 600; font-size: 13px;">សរុប</p>
                    </td>
                    ${bq};
                dataVisa.forEach((val, i) => {
                    fstr2 += ${bq}
                        <td class="w-40" style="background-color: #e1ebf5;">
                            <p style="font-weight: 500; font-size: 13px;">${ms}${cll}totals[val["type"]??0]??0${clr}</p>
                        </td>
                        ${bq};
                });
                fstr3 = ${bq}
                    <td class="w-60" style="background-color: #00c2ff;">
                        <p style="font-weight: 500; font-size: 13px;">${ms}${cll}listCountry["total"]??0${clr}</p>
                    </td>
                </tr>
                ${bq};
                tbody.innerHTML += fstr + fstr2 + fstr3;
            </script>
        </body>
        </html>
        `
        return html
    },

}