const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

let filenames = [];

const files = fs.readdirSync('files');

if (files.length > 0) {
    filenames = files.map(file=>path.basename(file));
} else {
    throw new Error('No files found in the directory.');
}

// Configure the AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,   // replace with your access key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // replace with your secret access key
  region: process.env.AWS_REGION // replace with your desired region, e.g., 'us-east-1'
});

const s3 = new AWS.S3();

function uploadFile(filename, directory) {
    // Define the parameters for the upload
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET, // replace with your bucket name
        Key: filename, // replace with the desired key for the file in the bucket
        Body: '', // we will fill in the file stream here
        ACL: "public-read",
    };

    // Path to the file you want to upload
    const filePath = path.join(directory, filename); // replace with your local file path

    // Create a read stream for the file
    const fileStream = fs.createReadStream(filePath);

    // Handle errors from the file stream
    fileStream.on('error', (err) => {
    console.error('File Error', err);
    });

    // Set the Body parameter of the uploadParams object
    uploadParams.Body = fileStream;

    // Call S3 to upload the file
    s3.upload(uploadParams, (err, data) => {
    if (err) {
        console.error('Error', err);
    } else {
        console.log('Upload Success', data.Location);
    }
    });
}

filenames.forEach((filename) => {
    console.log('>> Uploading>>', filename);
    uploadFile(filename, 'files')
})