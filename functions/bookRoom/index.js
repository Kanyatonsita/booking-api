const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'rooms-db';

const bookRoomHandler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);

    const bookingItem = {
    id: uuidv4(),
      capacity: requestBody.capacity,
      checkIn: requestBody.checkIn,
      checkOut: requestBody.checkOut,
      name: requestBody.name,
      'E-post': requestBody['E-post'],
      type: requestBody.type,
    };

    await db.put({
      TableName: TABLE_NAME,
      Item: bookingItem,
    }).promise();

    // Respond with success message
    return sendResponse(200, { message: 'Booking successful', booking: bookingItem });
  } catch (error) {
    console.error('Error:', error);
    return sendResponse(500, { message: 'Internal Server Error' });
  }
};


module.exports = {
  handler: bookRoomHandler,
};
