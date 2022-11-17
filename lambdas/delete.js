'use strict';

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const deletedItems = [];
const SQS_THRESHOLD = 5;
let deleted = 0;

function archieveInS3() {

    let csv = "item_id,text\r\n";
    deletedItems.forEach(item => csv += `${item.item_id},${item.text}\r\n`);

    const params = {
        Bucket: 'todo-app-archive-bucket',
        Key: "archieve " + new Date().toISOString() + ".csv",
        Body: csv
    };

    s3.upload(params, function (error) {
        if (error) { console.error(error) }
        callback(null, { statusCode: 200, body: JSON.stringify({}), });
    });
}

function deleteSqsMessage(url, handle, callback) {
    const params = { QueueUrl: url, ReceiptHandle: handle };
    sqs.deleteMessage(params, (error, data) => {
        if (error) {
            console.log("SQS Delete Error", error);
        } else {
            deleted++;
            if (deleted === SQS_THRESHOLD) {
                archieveInS3(callback);
            } else {
                receiveSqsMessage(url, callback);
            }
        }
    });
}

function deleteDynamoDbItem(url, message, callback) {
    const params = { TableName: "Todos", Key: { item_id: JSON.parse(message.Body).item_id } };
    dynamoDb.delete(params, (error) => {
        if (error) {
            console.error("Dynamodb Delete Error", error);
        } else {
            deleteSqsMessage(url, message.ReceiptHandle, callback);
        }
    });
}

function saveBeforeDeleting(url, message, callback) {
    const item_id = JSON.parse(message.Body).item_id;
    const params = { TableName: 'Todos', Key: { 'item_id': item_id } };
    dynamoDb.get(params, (err, data) => {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("archieve read Success", data.Item);
            deletedItems.push({ item_id: item_id, text: data.Item.text });
            deleteDynamoDbItem(url, message, callback);
        }
    });
}

function receiveSqsMessage(url, callback) {
    const params = { MessageAttributeNames: ["All"], QueueUrl: url };
    sqs.receiveMessage(params, (error, data) => {
        if (error) {
            console.error("SQS Receive Error", error);
        } else if (data.Messages) {
            saveBeforeDeleting(url, data.Messages[0], callback);
        }
    });
}

module.exports.deleteSQSTodos = (event, context, callback) => {
    const params = { QueueName: 'delete-todo-queue' };
    sqs.getQueueUrl(params, function (error, data) {
        if (error) {
            console.error("SQS get url Error", error);
        } else {
            receiveSqsMessage(data.QueueUrl, callback);
        }
    })
};