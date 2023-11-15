const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
    const { roomId } = event.pathParameters;
    
    try{
        await db.delete({
            TableName: 'rooms-db',
            Key : { id: roomId }
        }).promise();

        return sendResponse(200, { success: true });
    }catch (error){
        return sendResponse(500, { success: false, message : 'could not delete bookRoom'});
    }


}