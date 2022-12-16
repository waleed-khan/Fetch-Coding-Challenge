const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const port = 3000;

// Using local memory to contain receipts
let receipts = [];

// GET request to retrieve points from id 
app.get('/receipts/:id/points', (req, res) => {
    let id = req.params.id;
    if (receipts.length === 0) res.json("No receipts");
    receipts.forEach(element => {
        if (element["id"] === id) res.json({"points": `${element["points"]}`});
    });
    res.json("id not found");
});

// POST request for processing receipts
app.post('/receipts/process', async (req, res) => {
    let data = {retailer: req.body.retailer, 
                purchaseDate: req.body.purchaseDate, 
                purchaseTime: req.body.purchaseTime,
                total: req.body.total,
                items: req.body.items};
    let points = calculatePoints(data);
    let id = generateID(data);
    data["id"] = id;
    data["points"] = points;
    console.log(data);
    receipts.push(data);
    res.json({"id": `${id}`});
});

/** Returns number of points earned on receipt
 * 
 * @param {JSON} receiptData 
 * @returns {number} of points earned
 */
function calculatePoints(receiptData) {
    let total = 0;

    // Use regex to get rid of any characters that aren't alphanumeric
    let trimmedName = receiptData["retailer"].replace(/\W/g, "");
    console.log(trimmedName);
    console.log(trimmedName.length);
    total += trimmedName.length;
    
    // Check if total is a whole dollar amount (+50 points)
    let receiptTotal = receiptData["total"];
    console.log(receiptTotal);
    let totalSplit = receiptTotal.split('.');
    console.log(totalSplit);
    if (totalSplit[1] == '00') total += 50;

    // Check if total is multiple of 0.25 (+25 points)
    if (receiptTotal % 0.25 === 0) total += 25;

    // Check how many items are in receipt (+5 points for every 2 items)
    let numItems = Math.floor(receiptData["items"].length / 2);
    console.log(numItems);
    total += (5 * numItems);

    // If trimmed length of item description is multiple of 3, multiple price by 0.2, round up to nearest int, add to points
    let items = receiptData["items"];
    items.forEach(element => {
        let trimmedDesc = element["shortDescription"].trim();
        if (trimmedDesc.length % 3 === 0) total += Math.ceil(element["price"] * 0.2);
    });
    
    // Check if day purchased is odd (+6 points)
    let dateSplit = receiptData["purchaseDate"].split('-');
    if (dateSplit[2] % 2 !== 0) total += 6;

    // Check if purchased between 2 and 4 pm (+10 points)
    let timePurchased = receiptData["purchaseTime"];
    if (timePurchased >= "14:00" && timePurchased <= "16:00") total += 10;
    
    console.log(total);
    return total;
}

/** Very simple hash function that generates "unique" id for receipt
 *  For more security, could use hash like md5 or random number generators
 * 
 * @param {JSON} receipt 
 * @returns {string} id generated for receipt
 */
function generateID(receipt) {
    let id = "";
    id += receipt["retailer"].charAt(0);
    id += receipt["purchaseDate"];
    id += receipt["purchaseTime"];
    console.log(id);
    return id;
}

app.listen(port, () => console.log(`listening on ${port}`));