const puppeteer = require('puppeteer')
const fs = require('fs');

async function tutorial() {
   try {

       const URL = 'https://www.rew.ca/'
       const browser = await puppeteer.launch({ headless: false,defaultViewport: null,
        slowMo:10, });
       const page = await browser.newPage();

       await page.goto(URL,[
        10000,
        { waitUntil: "domcontentloaded" }
        ]);
        // let elementToClick = `#headerMenu > a:nth-child(1)` 
        // await page.waitForSelector(elementToClick);
        
        // await Promise.all([
        // page.click(elementToClick),
        // page.waitForNavigation({ waitUntil: 'networkidle2' }),
        // ])

       await page.type('#listing_search_query', 'windsor')
       await Promise.all([
           page.click('#new_listing_search button')[0],
           page.waitForNavigation([
            10000,
            { waitUntil: "domcontentloaded" }
            ]),
       ]);
       
       let pagesToScrape = 25;
       let currentPage = 1;
       let data = []
       while (currentPage <= pagesToScrape) {
        let newResults = await page.evaluate(() => {
           let results = []
            //pagesToScrape = document.querySelector('.paginator ul li:nth-child(7)').innerText
            let items = document.querySelectorAll('article')
            items.forEach((item) => {
                results.push({
                    price: item.querySelector('.displaypanel-price').innerText,
                    image: item.querySelector('img').src,
                    title: item.querySelector('.displaypanel-body > a').title,
                    url: item.querySelector('.displaypanel-body > a').href,
                    bd: item.querySelector('.displaypanel-section.clearfix ul li').innerText,
                    ba: !item.querySelector('.displaypanel-section.clearfix ul li:nth-child(2)') ? '' : item.querySelector('.displaypanel-section.clearfix ul li:nth-child(2)').innerText, 
                    ft: !item.querySelector('.displaypanel-section.clearfix ul li:nth-child(3)') ? '' : item.querySelector('.displaypanel-section.clearfix ul li:nth-child(3)').innerText,
                    location: !item.querySelector('.displaypanel-info') ? '' : item.querySelector('.displaypanel-info').innerText,
                    house: !item.querySelector('.displaypanel-info:nth-child(2)') ? '' : item.querySelector('.displaypanel-info:nth-child(2)').innerText
                })
            })
           
           return results
       })
       data = data.concat(newResults)
           if (currentPage < pagesToScrape) {
               await page.click('.paginator--nodivider a')
               await page.waitForSelector('article')
               await page.waitForSelector('.paginator--nodivider a')
           }
           currentPage++;
       }

       console.log(data)
       fs.writeFile ("input.json", JSON.stringify(data), function(err) {
        if (err) throw err;
        console.log('complete');
        }
    );
       
       await browser.close()

   } catch (error) {
       console.error(error)
   }
}

tutorial()