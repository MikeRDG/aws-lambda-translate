import { getMessageFromSqs } from './sqs-service';
import { addPostingDramTranslates, getDreamsByPId, getPostingDreamById} from './repository';
import { translateDream, translatePostingDream } from './translate';

export const lambdaHandler = async () => {
    try {

        const getMessage = await getMessageFromSqs();
        if (!getMessage) {
            console.log('Message queue is empty');
            return;
        }

        const getPostingDream = await getPostingDreamById(getMessage.id);
        const getDreams = await getDreamsByPId(getMessage.id);

        console.log(getPostingDream)

        const getTranslatePostingDream = await translatePostingDream(getPostingDream);
        const getTranslateDreams = await translateDream(getDreams);

        await addPostingDramTranslates(getTranslatePostingDream, getTranslateDreams);

        console.log('----finish----')
    } catch (err) {
        console.error(err);
    }
};