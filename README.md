# Bank API

## Introduction
 This application allows users to create an account, fund their account, send money to another user, and check their account balance and transaction history.

## Key Features of this Application
* User Authentication
Users are authenticated and validated using JWT web token. Generating tokens on signup and login ensures API endpoints are protected.

* Users
    * Create an account
    * Fund their account
    * Securely send money from their account to the account of another user
    * Check their account balance and transactions

## Technologies Used
- Node.js

- Express.js

- TypeScript

- TypeORM

- PostgreSQL

- JWT

- Bcrypt


## Usage

You can access the app on render at [BankAPI](https://bank-api-z91q.onrender.com/)

Alternatively, You may clone the repository and run the app locally to use.

## Local Installation Guide

* Clone the repository 
    * git clone https://github.com/atomicman57/bank-api
* Navigate to the project directory **cd bank-api**
* Install the dependencies using **yarn install**
* Rename .env.sample to .env and add the required Database information.
* Run **npm start** to start the application.
* The app will start on your local server.
* Run tests with: **npm test**


## API Documentation

The application will start on `http://localhost:3000` by default.
## Available Routes
### Authentication
#### POST /api/v1/user/signup

Creates a new user account.
##### Request Body 
- `firstName` (string): Required. The first name of the user. 
- `lastName` (string): Required. The last name of the user. 
- `email` (string): Required. The email address of the user. 
- `password` (string): Required. The password of the user. Must be at least 6 characters long.
##### Response 
- `token` (string): The JWT token to be used for authentication. 
- `user` (object): The newly created user object.
#### POST /api/v1/user/login

Logs in a user.
##### Request Body 
- `email` (string): Required. The email address of the user. 
- `password` (string): Required. The password of the user.
##### Response 
- `token` (string): The JWT token to be used for authentication. 
- `user` (object): The user object.
#### GET /api/v1/user/currentUser

Gets the current user.
##### Response 
- `user` (object): The current user object.
#### GET /api/v1/user/balance

Gets the balance of the current user.
##### Response 
- `balance` (number): The current user's balance.
### Transactions
#### GET /api/v1/transaction

Gets the transactions of the current user.
##### Query Parameters 
- `page` (number): Optional. The page number to retrieve. Defaults to 1. 
- `limit` (number): Optional. The number of transactions to retrieve per page. Defaults to 10.
##### Response 
- `transactions` (array): An array of transaction objects. 
- `total` (number): The total number of transactions. 
- `totalPages` (number): The total number of pages. 
- `currentPage` (number): The current page number.
#### POST /api/v1/transaction/fund

Funds the current user's account.
##### Request Body 
- `amount` (number): Required. The amount to fund the account with.
##### Response 
- `user` (object): The updated user object.
#### POST /api/v1/transaction/transfer

Transfers money from the current user's account to another user's account.
##### Request Body 
- `recipientId` (number): Required. The ID of the recipient user. 
- `amount` (number): Required. The amount to transfer.
##### Response 
- `sender` (object): The updated sender user object. 
- `recipient` (object): The updated recipient user object.
## Error Handling

The API uses HTTP status codes to indicate the status of a request. The following HTTP status codes may be returned:
- 200 OK: The request was successful.
- 201 Created: The resource was created successfully.
- 400 Bad Request: The request was invalid or could not be understood by the server.


## Contributing

* Fork this repositry to your account.
* Clone your repositry: git clone git@github.com:your-username/docvault.git
* Create your feature branch: git checkout -b feature/feature-id/<3-4 word feature description>
* Commit your changes: git commit -m "feature(scope): (subject) <BLANK LINE> (body) <BLANK LINE> (footer)"
* Push to the remote branch: git push origin new-feature
* Open a pull request.

* Note this project uses javascript ES6 and [Airbnb style guide](https://github.com/airbnb/javascript)
- Commit Message Convention
    - scope should be something specific to the commit change e.g logo
    - subject text should:
        - use present tense: "save" not "saved" or "saving"
        - not capitalize first letter i.e no "Carry to safety"
        - not end with a dot (.)
    - Message body (optional) If a body is to be written, it should:
      - written in present tense.
      - include reason for change and difference in the previous behaviour

    - Message Footer This should be used for referencing the issues using the following keywords: Start, Delivers, Fixes and Finishes. It should be written as:
      - [Start #345]
    
## License

This project is authored by Philips Blessing and is licensed 
for your use, modification and distribution under [the MIT license](https://en.wikipedia.org/wiki/MIT_License). 