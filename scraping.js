const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const json2csv = require("json2csv").Parser;

const product = "https://www.flipkart.com/search?q=mobiles&as=on&as-show=on&otracker=AS_Query_TrendingAutoSuggest_6_0_na_na_na&otracker1=AS_Query_TrendingAutoSuggest_6_0_na_na_na&as-pos=6&as-type=TRENDING&suggestionId=mobiles&requestId=1207aa19-cfe5-41a6-a245-8590c42c3cff";

(async () =>{
    let flipkartprod = []
    const response= await request ({
        uri :product,
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
        },
        gzip: true
    });

    let $ = cheerio.load(response)
    let ProdName = $('div[class="_4rR01T"]').text(); //Product Name
    let Rating = $('span[class="_2_R_DZ"]').textContent; //Reviews and ratings
    let Stars = $('div[class="_3LWZlK"]').textContent; //Star Rating
    let SellingPrice = $('div[class="_30jeq3 _1_WHN1"]').textContent; //Displayed Price
    let OrigPrice = $('div[class="_3I9_wc _27UcVY"]').textContent; //MRP
    let ImgLink = $('img[class="_396cs4 _3exPp9"]').attr('src') //IMAGE

    flipkartprod.push({
        ProdName, Rating, Stars, SellingPrice, OrigPrice, ImgLink,
    });
    console.log("Hi");
    const j2cp = new json2csv()
    const csv = j2cp.parse(flipkartprod)

    fs.writeFileSync("./product.csv", csv, "utf-8");

}

)();

