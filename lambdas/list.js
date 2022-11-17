'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const params = {
  TableName: "Todos",
  FilterExpression: "isDeleted = :d",
  ExpressionAttributeValues: {
    ":d": false
  }
};

module.exports.getAllTodos = (event, context, callback) => {
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      });
    }
  });
};