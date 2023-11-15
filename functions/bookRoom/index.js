const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'rooms-db';

const validateBookingConditions = (booking, roomType) => {
  const { capacity, type } = booking;

  if (capacity === 1) {
    return ['Single Room', 'Double Room', 'Suite'].includes(type);
  } else if (capacity === 2) {
    return ['Double Room', 'Suite'].includes(type);
  } else if (capacity > 2) {
    return type === 'Suite';
  }

  return false;
};

const validateRoomType = (bookingType, roomType) => {
  return bookingType === roomType;
};

const bookRoomHandler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { roomId } = event.pathParameters;

    const roomData = await db.get({
      TableName: TABLE_NAME,
      Key: { id: roomId },
    }).promise();

    const roomType = roomData.Item.type;

    const isValidBooking = validateBookingConditions(requestBody, roomType);

    if (!isValidBooking) {
      return sendResponse(400, { message: 'Invalid booking conditions' });
    }

    const isValidRoomType = validateRoomType(requestBody.type, roomType);

    if (!isValidRoomType) {
      return sendResponse(400, { message: 'Invalid room type' });
    }

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
    const checkOutDate = new Date(requestBody.checkOut);
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
      Key: { id: roomId },
      UpdateExpression: 'SET #booked = list_append(if_not_exists(#booked, :empty_list), :bookingItem)',
      ExpressionAttributeNames: { '#booked': 'booked' },
      ExpressionAttributeValues: {
        ':bookingItem': [bookingItem],
        ':empty_list': [],
      },
    }).promise();

    return sendResponse(200, { message: 'Booking successful', booking: bookingItem });
  } catch (error) {
    console.error('Error:', error);
    return sendResponse(500, { message: 'Internal Server Error' });
  }
};

module.exports = {
  handler: bookRoomHandler,
};
