import AWS from 'aws-sdk';
import { Status } from './translate-status';

const supportedLanguages = ['zh', 'en', 'fr', 'de', 'it', 'ko', 'pt', 'ru', 'es', 'tr', 'ja'];

const translate = new AWS.Translate({ apiVersion: '2017-07-01' });
export async function translateText(sourceLang: string, targetLang: string, text: string) {
    try {
        const params = {
            SourceLanguageCode: sourceLang,
            TargetLanguageCode: targetLang,
            Text: text,
        };
        const data = await translate.translateText(params).promise();
        return data.TranslatedText;
    } catch (err) {
        console.error('Error translating text:', err);
    }
}

function getTranslateLanguages(lang: string) {
    return supportedLanguages.filter((l) => l !== lang);
}

export async function translatePostingDream(postingDreamTranslate: any) {
    if (!postingDreamTranslate || !postingDreamTranslate.general_comment) {
        console.log('----general_comment is not exist----')
        return
    }

    const response = [];

    const currentLang = postingDreamTranslate.lang;

    const langs = getTranslateLanguages(currentLang);


    for (const lang of langs) {
        const generalComment = await translateText(currentLang, lang, postingDreamTranslate.general_comment);
        response.push({
            generalComment,
            lang,
            postingDreamId: postingDreamTranslate.posting_dream_id
        });
    }

    return response;
}

export async function translateDream(dreams:any[]) {
    const response = [];

    for (const dream of dreams) {
        const currentLang = dream.lang;
        const langs = getTranslateLanguages(currentLang);
        for (const lang of langs) {
            const dreamTitle = await translateText(currentLang, lang, dream.dream_title);
            const dreamStory = await translateText(currentLang, lang, dream.dream_story);
            response.push({
                dreamTitle,
                dreamStory,
                lang,
                dreamId: dream.dream_id,
                status: Status.COMPLETED,
            });
        }
    }

    return response;
}
