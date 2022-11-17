'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

module.exports.queueTodo = (event, context, callback) => {
    const item_id = event.pathParameters.item_id;
    sqs.getQueueUrl({ QueueName: 'delete-todo-queue' }, (err1, data) => {
        if (err1) {
            console.error("Error", err1);
        } else {
            sqs.sendMessage({
                MessageBody: JSON.stringify({ item_id: item_id }),
                QueueUrl: data.QueueUrl
            }, (err2) => {
                if (err2) {
                    console.error("Error", err2);
                } else {
                    dynamoDb.update({
                        TableName: "Todos", Key: { 'item_id': item_id },
                        UpdateExpression: "set isDeleted=:d", ExpressionAttributeValues: { ':d': true }
                    }, (err3) => {
                        if (err3) {
                            console.error(err3);
                        } else {
                            callback(null, { statusCode: 200, body: item_id });
                        }
                    });
                }
            });
        }
    });
};