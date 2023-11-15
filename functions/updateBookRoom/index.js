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

