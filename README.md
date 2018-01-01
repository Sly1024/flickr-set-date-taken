# flickr-set-date-taken
A Flickr util app to set 'date taken' of photos to what is encoded in the file name.

# How to run

1. Install dependencies
```
npm install
```

2. Read instructions in `flickr_tokens.js`.
3. Start the program with:
```
node process_photos.js
```
The first run will take a long time, because it syncs down the API description JSON files (222 at the time of writing) into the /data folder.
