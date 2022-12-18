# shipment
#### The Shipment Service is for managing the picking, packing, and shipping of all orders.

![shipping image](https://media.istockphoto.com/photos/global-business-logistics-import-export-background-and-container-picture-id1266958681?k=20&m=1266958681&s=612x612&w=0&h=VfpQl6Fe83meeTksLdtIvoclXldL2bfD7D9A72WO5nI=)

## Endpoints:
|                     ACTION                     | HTTP Method | PATHS (Path params and Query Params) |                  BODY                  |         SUCCESSFUL RESPONSE (assume Status Code 200)        |
|:----------------------------------------------:|:-----------:|:------------------------------------:|:--------------------------------------:|:-----------------------------------------------------------:|
| Retrieve all shipments                         | GET         | /shipments                           | N/A                                    | List of All Shipments (Shipment Representation)             |
| Retrieve shipment by ID                        | GET         | /shipments/:id                       | N/A                                    | Shipment with given ID (Shipment Representation)            |
| Retrieve shipments by user                     | GET         | /shipments?userID=:userID            | N/A                                    | Shipment representation (JSON)                              |
| Retrieve status of shipment by ID              | GET         | /shipments/:id/status                | N/A                                    | Status of Shipment Requestion                               |
| Get list of shipments that are being processed | GET         | /shipments?status=processing         | N/A                                    | List of shipments being processed (Shipment Representation) |
| Get list of shipments that have been shipped   | GET         | /shipments?status=shipped            | N/A                                    | List of shipped shipments (Shipment Representation)         |
| Get list of shipments that have been delivered | GET         | /shipments?status=delivered          | N/A                                    | List of delivered shipments (Shipment Representation)       |
| Delete an item from list for shipment by ID    | DELETE      | /shipments/:id/items/:id             | N/A                                    | Success Message                                             |
| Add an item to list for shipment by ID         | POST        | /shipments/:id/items/:id             | Item Representation (JSON)             | Success Message                                             |
| Get list of items for shipment by ID           | GET         | /shipments/:id/items                 | N/A                                    | Item Representation (JSON)                                  |
| Get list of items                              | GET         | /shipments/items                     | N/A                                    | List of items (Item Representation)                         |
| Get item by ID                                 | GET         | /shipments/items/:id                 | N/A                                    | Item representation (JSON)                                  |
| Bulk update of shipments                       | PUT         | /shipments                           | List of Shipment representation (JSON) | Success Message                                             |
| Update shipment by ID                          | PUT         | /shipments/:id                       | Shipment representation (JSON)         | Success Message                                             |
| Update item by ID                              | PUT         | /shipments/items/:id                 | Item representation (JSON)             | Success Message                                             |
| Patch update shipment by ID                    | PATCH       | /shipments/:id                       | Shipment representation (JSON)         | Success Message                                             |
| Add a shipment                                 | POST        | /shipments                           | Shipment representation (JSON)         | Success Message                                             |
| Add an item                                    | POST        | /shipments/items                     | Item representation (JSON)             | Success Message                                             |
| Delete a shipment                              | DELETE      | /shipments/:id                       | N/A                                    | Success Message                                             |
| Delete an item                                 | DELETE      | /shipments/items/:id                 | N/A                                    | Success Message                                             |

## Representations:

| Item Representation | Shipment Representation |
|---------------------|-------------------------|
| itemID              | shipmentID              |
| itemLocation        | customerID              |
|                     | orderNumber             |
|                     | orderDate               |
|                     | recieveAddress          |
|                     | sendAddress             |
|                     | trackingNumber          |
|                     | shippingCompany         |
|                     | status                  |
|                     | items (list)            |
|                     | weight                  |
