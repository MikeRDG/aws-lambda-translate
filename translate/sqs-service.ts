import AWS, {SQS} from 'aws-sdk';
import {queueUrl} from "./config";
AWS.config.update({region: 'us-east-1' });

const sqs = new AWS.SQS();

export async function getMessageFromSqs(): Promise<{ id: number } | null> {
    const params: SQS.Types.ReceiveMessageRequest = {
        QueueUrl: queueUrl!,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
    };
    const dataMessage = await sqs.receiveMessage(params).promise();
    if (!dataMessage.Messages) {
        console.log('No messages received.');
        return null;
    }

    if (!dataMessage || !dataMessage.Messages || !dataMessage.Messages[0]) {
        return null;
    }

    const message = dataMessage.Messages[0];
    // await deleteMessageFromQueue(message.ReceiptHandle);
    if (!message.Body) {
        return null;
    }
    const data = JSON.parse(message.Body);
    return { id: data.postingDreamId };
}

export async function deleteMessageFromQueue(receiptHandle: any) {
    try {
        const deleteParams: SQS.Types.DeleteMessageRequest = {
            QueueUrl: queueUrl!,
            ReceiptHandle: receiptHandle,
        };
        await sqs.deleteMessage(deleteParams).promise();
        console.log(`Deleted message from queue, ReceiptHandle: ${receiptHandle}`);
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
}
