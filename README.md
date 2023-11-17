<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

## AWS-Endpoints

POST infomantion om:
- Det finns tre typer av rum:
- Enkelrum som tillåter enbart en 1 gäst
- Dubbelrum som tillåter 2 gäster
- Svit som tillåter 3 gäster
- Enkelrum kostar 500 kr / natt
- Dubbelrum kostar 1000 kr / natt
- Svit kostar 1500 kr / natt

```
POST - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/rooms

Example:
{
	"capacity": 2,
	"number": 105,
	"price_per_night": 1000,
	"type": "Double Room"
}
```

GET alla 20rum

```
GET - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/rooms
```

POST gör en booking till en särskild rum med hjälp av att använda roomID

```
POST - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/bookings/{roomId}
```

PATCH  ändra bokning med hjälp av att använda Namn på den som bokade rummet

```
PATCH - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/rooms/{userId}
```

PATCH   avboka rum ifall kund inte längre kan komma med hjälp av att använda bookingID

```
PATCH - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/checkoutGuestWithID/{bookingID}
```

GET alla rum som är redan bokad.

```
GET - https://19k80uiybg.execute-api.eu-north-1.amazonaws.com/allBookRooms
```



# Serverless Framework AWS NodeJS Example

This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework. The deployed function does not include any event definitions as well as any kind of persistence (database). For more advanced configurations check out the [examples repo](https://github.com/serverless/examples/) which includes integrations with SQS, DynamoDB or examples of functions that are triggered in `cron`-like manner. For details about configuration of specific `events`, please refer to our [documentation](https://www.serverless.com/framework/docs/providers/aws/events/).

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
