const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {

    const result = await db.scan({
        TableName: 'rooms-db'
      }).promise();
    
    try {
        
    const bookRooms = result.Items.filter(item => Array.isArray(item.booked) && item.booked.length > 0);
    
    if (bookRooms.length > 0) {
        return sendResponse(200, { rooms: bookRooms });
    } else {
        return sendResponse(404, { message: 'Booking not found' });
    }
    } catch (error) {
        return sendResponse(500, {resultItems: result.Items});
    }
}