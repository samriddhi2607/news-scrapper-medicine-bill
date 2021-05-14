// if n==1 then the news of covid with link , headline and  timestamp will come .
// if n==2 , then the medicine bill will be generated , with the name of the medicine , store and the price of the medicine.
let n = process.argv[2]; // to see which number is called (1 or 2)
let pin = process.argv[3]; // pin code ( for the medical bill)
let len = process.argv[4]; // no of medicines
let sum =0 ;                // the toatal sum of of the medicines
let med=[]; // the medicines .

let j =5 ; // since the medicine will start at 5 number .
for(let i = 0 ; i<len; i++)
{
    med.push(process.argv[j]);
    j= j+1 ;
}


let tab ;

if(n==1) 
{

let request = require("request");
let cheerio = require("cheerio"); 
let fs = require("fs");
let loadedHtml ; 
// this is for generating the links and the headlines of the top and latest news .
function responsehandler(err , res , body)
{
    if(!err)
    {
        loadedHtml= cheerio.load(body);
        let top = loadedHtml(".top-newslist.clearfix span.w_tle>a");  // for the top news column 
        let headline = loadedHtml(".list5.clearfix span.w_tle>a"); // for the latest news column 

        for(let y = 0 ; y<top.length ; y++)
        {
            let hyperlink = loadedHtml(top[y]).attr("href"); // selecting the hyperlink 
            let name =  loadedHtml(top[y]).text() ; // selecting  the headline of the given links 
            let link = "https://timesofindia.indiatimes.com/coronavirus/vaccine"+hyperlink ;
            gettimestamp(link , name);

        }
        for(let x =0 ; x<5 ; x++) // selecting the top 5 (latest news)
        {
            let hyperlink = loadedHtml(headline[x]).attr("href"); // selecting the hyperlink 
            let name =  loadedHtml(headline[x]).text() ; // selecting  the headline of the given links 
            let link = "https://timesofindia.indiatimes.com/coronavirus/vaccine"+hyperlink ;
            gettimestamp(link , name);
        }
    }
}
request("https://timesofindia.indiatimes.com/coronavirus/vaccine", responsehandler);

// now we need to visit on each link and store the time stamp of each news .
function gettimestamp(li , name)
{
    request(li , function(err , res , body)
    {
        loadedHtml = cheerio.load(body);
        let timestamp = loadedHtml("._3Mkg-.byline");
        let datetime = timestamp.text();

     //for appeneding in the html file , so that the scraped data can be showcased in the html page .
        fs.appendFileSync("index.html", "<br>");
        fs.appendFileSync("index.html" , "HEADLINE :     ".bold().fontsize(5))
        fs.appendFileSync("index.html" ,name.fontsize(5));
        fs.appendFileSync("index.html", "<br>");
        fs.appendFileSync("index.html" ,"LINK: ".bold().fontsize(5));
        fs.appendFileSync("index.html" ,li.link(li).fontsize(5));
        fs.appendFileSync("index.html" ,"<br>");
        fs.appendFileSync("index.html" , "DATE:          ".bold().fontsize(5));
        fs.appendFileSync("index.html",datetime.fontsize(5));
        fs.appendFileSync("index.html" , "<br>");
        fs.appendFileSync("index.html" , "<hr>");
       
    })
}

}

// for the medical bill generator . (using automation)
else if(n==2)
{
  const puppeteer = require("puppeteer");
  let fs = require("fs");

  (async function()
  {
      let browser = await puppeteer.launch(
        {
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
        slowMo:5 ,
        }
      );

      let pages = await browser.pages();
      tab = pages[0];
      await tab.goto("https://www.medibuddy.in/about-medicine"); 

      await tab.waitForSelector('input[name ="pincode"]'); // for the pincode
      await tab.type('input[name ="pincode"]' , pin);

      await tab.waitForSelector(".br-15.btn.btn-primary.btn-block.p-t-10.p-b-10"); 
      await tab.click(".br-15.btn.btn-primary.btn-block.p-t-10.p-b-10");


      // to select the city delhi.
      await tab.waitForSelector(".top-cities.text-center.cursor-pointer.ng-pristine.ng-untouched.ng-valid");
      let cities = await tab.$$(".top-cities.text-center.cursor-pointer.ng-pristine.ng-untouched.ng-valid");
      let delhicity = cities[2];
      await tab.waitForTimeout(5000);
      delhicity.click();
      await tab.keyboard.press("Enter");

    // to search the medicine 
    for(let i =0 ; i<med.length ; i++)
    {
        let medicine = med[i];
       await tab.waitForSelector("#search");
       await tab.type("#search" , medicine);
       await tab.waitForTimeout(5000);
       await tab.keyboard.press("Enter");

      // now we want the name, store price of each medicine.
       await medical();
    }

    console.log("Final sum");
    console.log(sum);
    let s = sum.toString();
    fs.appendFileSync("m.html", "<br>");
    fs.appendFileSync("m.html","TOTAL AMOUNT:                   RS:                                               ".fontsize(5).bold());
    fs.appendFileSync("m.html",s.fontsize(5));
    fs.appendFileSync("m.html", "<br>");
     
})();

async function medical()
{
    // if the medicine is available then.
    try
    {
        await tab.waitForSelector(".m-b-5.bold.smdTxt"); // for name
        let title = await tab.evaluate(function()
        {
            return document.querySelector(".m-b-5.bold.smdTxt").innerText;
        });
        await tab.waitForSelector(".gray-color.m-b-10.xsTxt"); // for store
        let store = await tab.evaluate(function()
        {
            return document.querySelector(".gray-color.m-b-10.xsTxt").innerText;
        });
        
        await tab.waitForSelector("div.light-bold"); // for price
        let price = await tab.evaluate(function()
        {
            return document.querySelector("div.light-bold").innerText;
        });
         
        let p = price.split(' '); // as price comes with the rupess sign and all .
        let myString=p[0];
        myString = myString.replace(/\D/g,''); // calculating the number of price
        let number = Number(myString);
    
        sum = sum +number ;     // cacluclting the bill price. (total amount)
    
    
        console.log(title);
        console.log(store);
        console.log(price);
        

        fs.appendFileSync("m.html", "<br>");
        fs.appendFileSync("m.html" , "MEDICINE NAME:     ".bold().fontsize(5))
        fs.appendFileSync("m.html" ,title.fontsize(5));
        fs.appendFileSync("m.html", "<br>");
        fs.appendFileSync("m.html" ,"STORE :         ".bold().fontsize(5));
        fs.appendFileSync("m.html" ,store.fontsize(5));
        fs.appendFileSync("m.html" ,"<br>");
        fs.appendFileSync("m.html" , "PRICE:                                                     ".bold().fontsize(5));
        fs.appendFileSync("m.html", price.fontsize(5));
        fs.appendFileSync("m.html" , "<br>");
        fs.appendFileSync("m.html" , "<hr>");

      
    
        // for clearing the search bar so that the next medicine can be searched .
        await tab.waitForSelector("#search");
        await tab.click("#search");
        await tab.keyboard.down("Control");
        await tab.keyboard.press("A");
        await tab.keyboard.press("X");
        await tab.keyboard.up("Control");
         
    }

    // if no store is found in the nearby pincode.
    catch(err)
    {
        console.log( "NO STORE AVAILABLE");
        fs.appendFileSync("m.html" , "NO STORE AVAILABLE".fontsize(5));
    }

}
  
}