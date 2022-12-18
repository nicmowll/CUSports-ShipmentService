const express = require('express')
const app = express()
app.use(express.json())

const shipment_list = require('./shipment_data.json')
const item_list = require('./item_data.json')

const item_missing_fields = (item) => {
    const keys = ["itemID", "itemLocation"]
    let missing_fields = []
    for(let key of keys) if(!item[key]) missing_fields.push(key);
    return missing_fields
}

const address_missing_fields = (address) => {
    const keys = ["line1", "city", "state", "zipcode", "country"]
    let missing_fields = []
    for(let key of keys) if(!address[key]) missing_fields.push(key);
    return missing_fields
}

const shipment_missing_fields = (shipment) => {
    const keys = ["shipmentID", "customerID", "orderNumber", "receiveAddress", 
                  "sendAddress", "status", "items", "weight", "trackingNumber", 
                  "shippingCompany"]
    let missing_fields = []
    for(let key of keys) {
        if(!shipment[key]) {
            missing_fields.push(key);
            continue;
        }
        if(key == "receiveAddress" || key == "sendAddress") {
            let missing_address_fields = address_missing_fields(shipment[key]);
            if(missing_address_fields != "") missing_fields.push(`(${key}: ${missing_address_fields})`);
        }
        if(key == "items") for (let item of shipment[key]) {
            let missing_item_fields = item_missing_fields(item);
            if(missing_item_fields != "") missing_fields.push(`(${key}: ${missing_item_fields})`);
        }
    }
    return missing_fields
}

app.post('/shipments/:shipmentID/items', (req, res) => {
    let shipmentID = req.params.shipmentID
    let newItem = req.body

    const missing = item_missing_fields(newItem);

    if(missing == "") {
        try {
            for (let i = 0; i < shipment_list.length; i++) {
                if (shipment_list[i].shipmentID == shipmentID) {
                    shipment_list[i].items.push(newItem)
                    res.status(200).json({"message": "successfully added item to shipment"})
                }
            }

            res.status(404).json({"message": "Shipment id not found"})
        }
        catch(err) {
            res.status(500).json({"message":`${err}`})
        }
    }
    else 
        res.status(400).json({"message": "Request contains an invalid body"})
})

app.delete('/shipments/:shipmentID/items/:itemID', (req, res) => {
    let shipmentID = req.params.shipmentID
    let itemID = req.params.itemID

    try {
        for (let i = 0; i < shipment_list.length; i++) {
            if (shipment_list[i].shipmentID == shipmentID) {
                for(let j = 0; j < shipment_list[i].items.length; j++) {
                    if (shipment_list[i].items[j].itemID == itemID) {
                        shipment_list[i].items.splice(j, 1)
                        res.status(200).json({"message": "successfully deleted item from shipment"})
                    }
                }
            }
        }

        res.status(404).json({"message": "Shipment id not found"})
    }
    catch(err) {
        res.status(500).json({"message":`${err}`})
    }
})

app.get('/shipments/:shipmentID/items', (req, res) => {
    let id = req.params.shipmentID
    try {
        for (let shipment of shipment_list) {
            console.log(shipment)
            if (shipment.shipmentID == id) {
                res.status(200).json(shipment.items)
            }
        }

        res.status(404).json({"message": "Shipment id not found"})
    }
    catch(err) {
        res.status(500).json({"message":`${err}`})
    }
})

app.get('/shipments', (req, res) => {
    try{
        if(!shipment_list){ res.status(404).json({"message": "shipments not found"}); return }
        if(JSON.stringify(req.query) == "{}"){ res.status(200).json(shipment_list); return }

        shipments_to_return = []
        for(let i = 0; i < shipment_list.length; i++){
            if(req.query.userID != undefined && req.query.status != undefined){
                if(String(req.query.status).toUpperCase() == String(shipment_list[i].status).toUpperCase() && req.query.userID == shipment_list[i].customerID){
                    shipments_to_return.push(shipment_list[i])
                }
            } else {
                if(String(req.query.status).toUpperCase() == String(shipment_list[i].status).toUpperCase() || req.query.userID == shipment_list[i].customerID){
                    shipments_to_return.push(shipment_list[i])
                }
            }
        }
        
        if(shipments_to_return == "") {
            res.status(404).json({"message": "shipments not found"}); 
            return 
        }
        
        res.status(200).json(shipments_to_return);

    } catch(err){
        res.status(500).json({"message":`${err}`})
    }
})

app.post('/shipments', (req, res) => {
    try{
        const new_shipment = req.body;
        const missing = shipment_missing_fields(new_shipment);

        if(missing == ""){
            shipment_list.push(new_shipment);
            res.status(200).json(shipment_list);
        } else{
            res.status(400).json({"message": `Request body is missing: ${missing}`});
        }
    } catch(err){
        res.status(500).json({"message":`${err}`})
    }
})

app.put('/shipments', (req, res) => {
    try{
        const shipmentsToUpdate = req.body;

        for(let shipment of shipmentsToUpdate){
            const missing = shipment_missing_fields(shipment);
    
            if(missing == ""){
                for(let i = 0; i < shipment_list.length; i++){
                    if(shipment_list[i].shipmentID == shipment.shipmentID){
                        shipment_list[i] = shipment;
                        break;
                    }
                    if(i == shipment_list.length-1){
                        res.status(404).json({"message": `shipmentID ${shipment.shipmentID} not found`});
                        return;
                    }
                }
            } else{
                res.status(400).json({"message": `Request body is missing: ${missing}`});
                return;
            }
        }
        res.status(200).json(shipment_list);
    } catch(err){
        res.status(500).json({"message":`${err}`})
    }
})

// Gets all of the items in a shipment
app.get("/shipments/items", (req, res) => {
    try {
        if(item_list) {
            res.status(200).json(item_list);
        } else {
            res.status(404).json({message: "404 Not Found: Could not locate item list"});
        }
    } catch {
        res.status(500).json({message: "500 Unexpected Error"});
    }
})

// Adds a new item to the list of items
app.post("/shipments/items", (req, res) => {
    try {
        const newItem = req.body;
        const missing = item_missing_fields(newItem);
        if(missing == "") {
            item_list.push(newItem);
            res.status(200).json({message: "200 OK: Successfully Posted Item"});
        } else {
            res.status(400).json({message: "400 Bad Request: Content Invalid"});
        }
    } catch {
        res.status(500).json({message: "500 Unexpected Error"});
    }
})

//Get shipments/items/:itemID
app.get("/shipments/items/:itemID", (req, res) => {
    try {
        const id = req.params.itemID;
        index = 0;
        
        let idFound = false;
        for(let i = 0; i < item_list.length; i++) {
            if(item_list[i].itemID == id) {
                idFound = true;
                index = i;
            }
        }

        if(!idFound) {
            res.status(404).json({error: "No item found for: " + id});
        }
        else {
            res.status(200).json(item_list[index]);
        }
    }
    catch {
        res.status(500).json({error: "Unexpected Error"});
    }
})

//Put shipments/items/:itemID

app.put("/shipments/items/:itemID", (req, res) => {
    try {
        const id = req.params.itemID;
        index = 0;

        let idFound = false;
        for(let i = 0; i < item_list.length; i++) {
            if(item_list[i].itemID == id) {
                idFound = true;
                index = i;
            }
        }

        if(!idFound) {
            res.status(404).json({error: "No item found for: " + id});
        }

        const itemID = req.body.itemID;
        const itemLocation = req.body.itemLocation;

        if(itemID == null || itemLocation == null) {
            res.status(400).json({error: "Content invalid"});
        }
        else {
            item_list[index].itemID = itemID;
            item_list[index].itemLocation = itemLocation;

            res.status(200).json({message: "Successfully updated item: " + id});
        }
    }
    catch {
        res.status(500).json({error: "Unexpected Error"});
    }
})

//Delete shipments/items/:itemID

app.delete("/shipments/items/:itemID", (req, res) => {
    try {
        const id = req.params.itemID;

        let idFound = false;
        for(let i = 0; i < item_list.length; i++) {
            if(item_list[i].itemID == id) {
                item_list.splice(i, 1);
                idFound = true;
            }
        }
    
        if(!idFound) {
            res.status(404).json({error: "No item found for: " + id})
        }
        else {
            res.status(200).json({message: "Successfully deleted item: " + id});
        }
    }
    catch {
        res.status(500).json({error: "Unexpected Error"});
    }
})


app.get("/shipments/:shipmentID", (req, res) => {
    try{ 
        const id = req.params.shipmentID;
        let foundID = false;
        for(let shipment of shipment_list)
        {
            if(id == shipment.shipmentID)
            {
                res.status(200).json(shipment);
                foundID = true;
                return;
            }
        }
        if(foundID == false)
        {
            res.status(404).json({"message": "shipment not found"});
        }
    }
    catch(err){
        res.status(500).json({"message": `${err}` });
    }
})

app.put("/shipments/:shipmentID", (req, res) => {
    try{
        const id = req.params.shipmentID;
        const shipment = req.body;
        const missing = shipment_missing_fields(shipment);

        if(missing == ""){
            for(let i = 0; i < shipment_list.length; i++)
            {
                if(shipment_list[i].shipmentID == shipment.shipmentID)
                {
                    shipment_list[i] = shipment;
                    shipment_list[i].shipmentID = id;
                    break;
                }
                if(i == shipment_list.length-1)
                {
                    res.status(404).json({"message": `shipmentID ${shipment.shipmentID} not found`});
                    return;
                }
            }
        } 
        else{
            res.status(400).json({"message": `Request body is missing: ${missing}`});
            return;
        }

        res.status(200).json({"message": "Successfully updated shipment"});
    } catch(err){
        res.status(500).json({"message":`${err}`});
    }
})


app.delete("/shipments/:shipmentID", (req,res) => {
    try{ 
        const id = req.params.shipmentID;
        let foundID = false;
        for(let i = 0; i < shipment_list.length; i++)
        {
            if(shipment_list[i].shipmentID == id)
            {
                shipment_list.splice(i,1);
                res.status(200).json({"message": "shipment successfully deleted"});
                foundID = true;
                return;
            }
        }
        if(foundID == false)
        {
            res.status(404).json({"message": "shipment not found"});
        }
    }
    catch(err){
        res.status(500).json({"message": `${err}` });
    }
})

app.get("/shipments/:shipmentID/status", (req, res) => {
    try{ 
        const id = req.params.shipmentID;
        let foundID = false;
        for(let shipment of shipment_list)
        {
            if(id == shipment.shipmentID)
            {
                res.status(200).json(shipment.status);
                foundID = true;
                return;
            }
        }
        if(foundID == false)
        {
            res.status(404).json({"message": "shipment not found"});
        }
    }
    catch(err){
        res.status(500).json({"message": `${err}` });
    }
})

app.patch("/shipments/:shipmentID" , (req, res) => {
    try{ 
        const id = req.params.shipmentID;
        let foundID = false;
        let new_shipment = req.body;

        for(let shipment of shipment_list)
        {
            if(id == shipment.shipmentID)
            {
                foundID = true;
                let invalidKeys = false;
                for(var key in new_shipment)
                {
                    if(!shipment.hasOwnProperty(key))
                    {
                        invalidKeys = true;
                    }
                }
                if(invalidKeys)
                {
                    res.status(400).json({"message": "Request body contains incorrect fields"})
                    break;
                }
                else
                {
                    for(var key in new_shipment)
                    {
                        shipment[key] = new_shipment[key];
                    }
                    res.status(200).json({"message": "200 OK: Successfully updated shipment"});
                    break;
                }
            }
        }
        if(foundID == false)
        {
            res.status(404).json({"message": "shipment not found"});
        }
    }
    catch(err){
        res.status(500).json({"message": `${err}` });
    }

})

let port = process.env.PORT || 3001
app.listen(port, () => {
    console.log(`Server on port ${port}`)
})