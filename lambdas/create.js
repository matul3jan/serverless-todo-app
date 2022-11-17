'use strict';

const crypto = require('crypto');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.createTodo = (event, context, callback) => {

    const data = JSON.parse(event.body);

    const params = {
        TableName: "Todos",
        Item: {
            item_id: crypto.randomUUID(),
            text: data.text,
            isDeleted: false
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.error(error);
        } else {
            callback(null, { statusCode: 200, body: JSON.stringify(params.Item) });
        }
    });
};