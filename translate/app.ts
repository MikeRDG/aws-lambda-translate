import { addPostingDramTranslates, getDreamsByPId, getPostingDreamById} from './repository';
import { translateDream, translatePostingDream } from './translate';
import {SQSEvent} from "aws-lambda";
import {deleteMessageFromQueue} from "./sqs-service";

export const lambdaHandler = async (event: SQSEvent) => {
    try {

        const startTime= Date.now()
        console.log('======start======')
        console.log(event.Records)

        if (event.Records.length == 0) {
            console.log("event has no record")
            return
        }

        const receiptHandle = event.Records[0].receiptHandle

        await deleteMessageFromQueue(receiptHandle)

        const getMessage =  JSON.parse(event.Records[0].body);


        console.log('getMessage', getMessage)
        // const getMessage = await getMessageFromSqs(event);
        if (!getMessage) {
            console.log('Message queue is empty');
            return;
        }

        const getPostingDream = await getPostingDreamById(getMessage.postingDreamId);
        const getDreams = await getDreamsByPId(getMessage.postingDreamId);

        console.log(getPostingDream)


        const dreamsIds = getDreams.map(dream =>dream.dream_id)
        const uniqueDreamsIds = [...new Set(dreamsIds)];

        console.log('uniqueDreamsIds====', uniqueDreamsIds)
        console.log('postingDreamId====', getMessage.postingDreamId)

        const getTranslatePostingDream = await translatePostingDream(getPostingDream);
        const getTranslateDreams = await translateDream(getDreams);

        await addPostingDramTranslates(getTranslatePostingDream, getTranslateDreams, getMessage.postingDreamId, uniqueDreamsIds );

        const duration = Date.now()-startTime

        console.log('----finish----', duration , 'ms')
    } catch (err) {
        console.error(err);
    }
};