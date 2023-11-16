const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event, context) => {
    console.log('Lambda function started');
    try {
        const { bookingID } = event.pathParameters;
        console.log('bookingID:', bookingID);

        const roomData = await db.scan({
            TableName: 'rooms-db',
        }).promise();

        const bookedRoom = roomData.Items.find(room => {

            const booking = room.booked && room.booked.find(b => b.id === bookingID);
            return booking !== undefined;
        });

        if (!bookedRoom) {
            return sendResponse(404, {message: "Booking not found"});
        }

        const bookingIndex = bookedRoom.booked.findIndex(b => b.id === bookingID);

        await db.update({
            TableName: 'rooms-db',
            Key: { id: bookedRoom.id },
            UpdateExpression: `REMOVE booked[${bookingIndex}]`
        }).promise();

        return sendResponse(200, { message: 'Checkout successfull'});
    } catch (error) {
      console.error('Error:', error);
      return sendResponse(500, { message: 'Internal Server Error' });
    }


}