const flickr = require('./flickr_promise');

(async () => {
    const per_page = 100;
    let page = 0;

    let processed = page*per_page;
    let total = 0;

    do {
        const photos = await flickr.call('people.getPhotos', { 
            authenticated: true, 
            page: ++page, per_page,
            // min_upload_date: '2017-12-03'   // sly
            // min_upload_date: '2017-12-05', // Moni
        });

        const photoResults = photos.photos && photos.photos.photo;
        if (!photoResults) throw 'No photos.photo in the response';

        if (photos.photos.total) total = parseInt(photos.photos.total);

        //console.log(JSON.stringify(photos, null, 2));
        console.log(`Got ${photoResults.length} results, total: ${total}, page: ${page}/${(total + per_page-1)/per_page | 0}.`);

        for (let i = 0; i < photoResults.length; ++i) {
            await processPhoto(processed, total, photoResults[i]);
            processed++;
        }        
    } while (processed < total);

    process.exit();    
})().catch(err => {
    console.error('Fatal', err);
    process.exit(1);
});


const dateRE = /.*(\d{4})[-.]?(\d{2})[-.]?(\d{2})[.]?[_ -]*(\d{2})[:]?(\d{2})[:]?(\d{2}).*/;

async function processPhoto(processed, total, photo) {
    try {
        const info = (await flickr.call('photos.getInfo', {
            photo_id: photo.id,
            secret: photo.secret
        })).photo;
        // console.log(JSON.stringify(info, null, 2));

        let title;
        if (!info.title || !(title = info.title._content)) throw 'No title._content in info.';
        if (!dateRE.test(title)) throw `Title doesn't match date RegExp "${title}".`;

        const titleDate = title.replace(dateRE, '$1-$2-$3 $4:$5:$6');

        //console.log(`Title: ${title} (${titleDate}), taken: ${info.dates.taken}`);
        
        if (info.dates.taken == titleDate) {
            console.log(`${processed}/${total} ID: ${photo.id}, title: ${title} (${titleDate}) - OK`);
        } else {
            console.log(`${processed}/${total} ID: ${photo.id}, title: ${title} (${titleDate}), taken: ${info.dates.taken}, attempting to correct...`);
            await flickr.call('photos.setDates', {
                photo_id: info.id,
                secret: info.secret,
                date_taken: titleDate,
                date_taken_granularity: 0
            });
            console.log('...OK');
        }
    } catch (err) {
        console.log(`${processed}/${total} ID: ${photo.id} Error processing photo -`, err);
    }
}