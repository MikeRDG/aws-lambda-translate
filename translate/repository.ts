import { pool } from './config';
import {Status} from "./translate-status";
export async function getPostingDreamById(id: number) {
    const client = await pool.connect();
    const query = `
        select * from posting_dream_translate where posting_dream_id = ${id}
    `;
    const result = await client.query(query);
    client.release();
    return result.rows[0];
}

export async function getDreamsByPId(id: number) {
    const client = await pool.connect();
    const query = `
        select *  from dream left join public.dream_translate dt on dream.id = dt.dream_id
        where posting_dream_id=${id}
    `;

    const result = await client.query(query);
    client.release();
    return result.rows;
}


export async function addPostingDramTranslates(getTranslatePostingDream:any, getTranslateDreams: any, postingDreamId:number, uniqueDreamsIds:number[]) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        if (getTranslatePostingDream) {
            const postingDreamTranslateQuery = `
            INSERT INTO posting_dream_translate (posting_dream_id, general_comment, is_original, lang)
            VALUES ($1, $2, false, $3)
        `;

            for (const postingDream of getTranslatePostingDream) {
                const { postingDreamId, generalComment, lang } = postingDream;
                await client.query(postingDreamTranslateQuery, [postingDreamId, generalComment, lang]);
            }
        }
        const translateDreamsQuery = `
            INSERT INTO dream_translate
            (dream_story, dream_title, is_original, lang, dream_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        for (let record of getTranslateDreams) {
            await client.query(translateDreamsQuery, [
                record.dreamStory,
                record.dreamTitle,
                false,
                record.lang,
                record.dreamId,
                new Date(),
                new Date(),
            ]);
        }

        const postingDreamQuery = 'UPDATE posting_dream SET status = $1, updated_at = now() WHERE id = $2';
        const values = [Status.COMPLETED, postingDreamId];

        const postingDreamRes = await client.query(postingDreamQuery, values);
        console.log(`posting dream updated: ${postingDreamRes.rowCount}`);


        for (const id of uniqueDreamsIds) {
            const query = `
                UPDATE dream 
                SET status = $1, updated_at = now() 
                WHERE id = $2
            `;
            const values = [Status.COMPLETED, id];

            const res = await client.query(query, values);
            console.log(`Row updated for id ${id}: ${res.rowCount}`);
        }

        await client.query('COMMIT');
        console.log('Bulk insert successful!');


    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during bulk insert:', err);
    } finally {
        client.release();
        console.log('-----finish-----')
    }

}


