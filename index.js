const { remote } = require('webdriverio');

;(async () => {
    const browser = await remote({
        capabilities: {
            browserName: 'chrome'
        }
    })
    let baseUrl = 'https://devop.lms.nodehill.com'
    await browser.url(baseUrl)
    await browser.pause(500)
    let footer = await browser.$('#footer')
    
    //only about 40 articles are loaded at first
    //scroll to footer 7 times to load all the articles
    for (let i = 0; i < 7; i++){
        await footer.scrollIntoView()
        await browser.pause(1500)
    }

    //find total articles - loop will run for articles.length
    let articles = await browser.$$('#article-link')
    //find all a tags, they contain hrefs that we can extract to go to each page
    let hrefs = await browser.$$('a')
    let links = []

    //the first 4 tags are not relevant thus we start at 4
    //since we are not going back to main page
    //all hrefs must be stored before the looping through pages start
    for (let i = 4; i < hrefs.length; i++){
        let href = await hrefs[i].getAttribute('href')
        links.push(href)
    }
    
    for (let i = 0; i < articles.length; i++){
        //combine the href extracted with the baseUrl
        //example baseUrl = 'https://devop.lms.nodehill.com'
        //example links[i] = '/article/losningsforslag-ovning-pa-react-fran-extradagar-webbutveckling'
        let actualUrl = baseUrl + links[i]
        await browser.url(actualUrl)

        //delete the main header from each article, otherwise i gets in the way of long screenshots
        await browser.execute(async()=>{
            let header = document.querySelector('#main-header')
            header.remove()
        })

        //some (longer) text is only loaded after you scroll down
        //after scrolling wait 3 sec for consistency
        await footer.scrollIntoView()
        await browser.pause(3000)

        //the screenshot will be stored in folder screenshots
        //with name number of the href accessed
        //find the last backslash
        let lastSlash = links[i].lastIndexOf('/')
        //cut out the title after the last backslash (otherwise path is invalid)
        let title = 'screenshots/' + links[i].slice(lastSlash+1) + '.png'

        //take a screenshot - saves as title
        await browser.saveScreenshot(title)
    }
    //close the browser window
    await browser.deleteSession()
})()