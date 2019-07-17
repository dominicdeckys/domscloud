// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
var bucket = 'domscloud';
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var config;

// Create the parameters for calling listObjects
var bucketParams = {
  Bucket : 'domscloud',
  Prefix: 'testdirectory/',
};

function getObject (name, cb) {
    //var s3 = new AWS.S3({apiVersion: '2006-03-01'});
    var params = {
        Bucket: bucket, 
        Key: name
    };
    s3.getObject(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            console.log('unable to get ' + name);
            cb(null);
        }
        else {
            console.log('Successfully got ' + name); // successful response
            cb(data);
        }
    });
}

/**
 * 
 */
function getObjectUrl (name, cb) {
    var params = {
        Bucket: bucket,
        Key: name,
        Expires: 60
    };
    var url = s3.getSignedUrl('getObject', params, function (err, url) {
        console.log('getObjectUrl', name, url);
        cb(url);
    });
}

function putObjectUrl (name, cb) {
    var params = {
        Bucket: bucket,
        Key: name,
        //Expires: 60
    };
    var url = s3.getSignedUrl('putObject', params, function (err, url) {
        console.log('putObjectUrl', name, url);
        cb(url);
    });
}

function putObject (name, data, cb) {
    // call S3 to retrieve upload file to specified bucket
    var uploadParams = {Bucket: bucket, Key: name, Body: data};

    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
        if (err) {
            console.log("Error", err);
            cb();
        } if (data) {
            console.log("Upload Success", data.Location);
            cb();
        }
    });
}

function postObjectUrl (name, data, cb) {
    var params = {
        Bucket: bucket,
        Fields: {
            key: name
        }
    };
    s3.createPresignedPost(params, function(err, data) {
    if (err) {
        console.error('Presigning post data encountered an error', err);
    } else {
        console.log('The post data is', data);
    }
    });
}

exampleconfig = {
"version":"1.0.1",
"name":"domscloud",
"cars":[ "Ford", "BMW", "Fiat" ]
};


function main () {
    //config = getObject('masterconfig.json');
    
    // getObject('masterconfig.json', (data) => {
    //     config = JSON.parse(data.Body);
    //     console.log(JSON.stringify(config));
    //     putObject('masterconfig2.json', JSON.stringify(config), () => {});
    // });

    postObjectUrl('hello.txt', null, (url) => {
        console.log(url);
    })
}

main();

// Call S3 to obtain a list of the objects in the bucket
// s3.listObjectsV2(bucketParams, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });
