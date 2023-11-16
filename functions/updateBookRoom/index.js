const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const { userId } = event.pathParameters;
    const requestBody = JSON.parse(event.body);

    const roomData = await db.scan({
      TableName: 'rooms-db',
    }).promise();

    const bookedRoom = roomData.Items.find(room => {
      const booking = room.booked && room.booked.find(b => b.name === userId);
      return booking !== undefined;
    });

    if (!bookedRoom) {
      return sendResponse(404, { message: 'Booking not found' });
    }

    const bookingIndex = bookedRoom.booked.findIndex(b => b.name === userId);

    const updatedBooking = {
      ...bookedRoom.booked[bookingIndex],
      checkIn: requestBody.checkIn || bookedRoom.booked[bookingIndex].checkIn,
      checkOut: requestBody.checkOut || bookedRoom.booked[bookingIndex].checkOut,
      capacity: requestBody.capacity || bookedRoom.booked[bookingIndex].capacity,
    };

    const isValidCapacity = validateCapacity(updatedBooking.type, updatedBooking.capacity);

    if (!isValidCapacity) {
      return sendResponse(400, { message: 'Invalid capacity for the selected type' });
    }

    const checkInDate = new Date(updatedBooking.checkIn);
    const checkOutDate = new Date(updatedBooking.checkOut);
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    switch (updatedBooking.type) {
      case 'Suite':
        updatedBooking.totalPrice = numberOfNights * 1500;
        break;
      case 'Double Room':
        updatedBooking.totalPrice = numberOfNights * 1000;
        break;
      case 'Single Room':
        updatedBooking.totalPrice = numberOfNights * 500;
        break;
      default:
        updatedBooking.totalPrice = 0;
    }

    await db.update({
      TableName: 'rooms-db',
      Key: { id: bookedRoom.id },
      UpdateExpression: `SET booked[${bookingIndex}] = :updatedBooking`,
      ExpressionAttributeValues: {
        ':updatedBooking': updatedBooking,
      },
    }).promise();

    return sendResponse(200, { message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error:', error);
    return sendResponse(500, { message: 'Internal Server Error' });
  }
};

const validateCapacity = (type, capacity) => {
  switch (type) {
    case 'Single Room':
      return capacity === 1;
    case 'Double Room':
      return capacity === 1 || capacity === 2;
    case 'Suite':
      return capacity >= 1 && capacity <= 3;
    default:
      return false;
  }
};
