const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'rooms-db';

const bookRoomHandler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { roomId } = event.pathParameters;
    
    const bookingItem = {
    id: uuidv4(),
      capacity: requestBody.capacity,
      checkIn: requestBody.checkIn,
      checkOut: requestBody.checkOut,
      name: requestBody.name,
      'E-post': requestBody['E-post'],
      type: requestBody.type,
    };

    const checkInDate = new Date(requestBody.checkIn);
    const checkOutDate = new Date(requestBody.checkOut)
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    let totalPrice;
    switch (requestBody.type) {
      case 'Suite':
        totalPrice = numberOfNights * 1500;
        break;
      case 'Double Room':
        totalPrice = numberOfNights * 1000;
        break;
      case 'Single Room':
        totalPrice = numberOfNights * 500;
        break;
      default:
        totalPrice = 0;
    }

    bookingItem.totalPrice = totalPrice;

    await db.update({
      TableName: TABLE_NAME,
      Key : { id: roomId },
      UpdateExpression: 'SET #booked = list_append(if_not_exists(#booked, :empty_list), :bookingItem)',
      ExpressionAttributeNames: { '#booked': 'booked' },
      ExpressionAttributeValues: {
          ':bookingItem': [bookingItem],
          ':empty_list': [],
      },
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
