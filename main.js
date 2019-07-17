const fs = require('fs');

var express = require('express')
var app = express()
var busboy = require('connect-busboy')
app.use(busboy())

function validateCreds(user, pass) {
    return user == 'ddeckys' && pass == 'pass'
}

function authenticate (res, user, pass) {
    if (!user || !pass) {
        res.status(403).send('Please specify username and password headers')
        return false
    }
    if (!validateCreds(user, pass)) {
        res.status(403).send('Username or password incorrect')
        return false
    }
    return true
}

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.status(200).send('This server only serves the api!');
})

app.get('/api/get/:filename', function (req, res) {
    
    if (!authenticate(res, req.headers.username, req.headers.password)) {
        return false
    }

    var fname = req.params.filename;

    if(req.headers.directory) {
        fname = req.headers.directory + '/' + fname
        console.log('new fname ' + fname)
    }

    fname = req.headers.username + '/' + fname

    fs.access(fname, fs.F_OK, (err) => {
        if (err) {
            console.error(err)
            res.status(404).send('Cannot find the file')
        }
        else {
            res.sendFile(fname, { root : __dirname})
        }
    })
})

app.get('/api/ls', function (req, res) {
    if (!authenticate(res, req.headers.username, req.headers.password)) {
        return false
    }
    var dir = '/' + req.headers.username
    if(req.headers.directory) {
        dir = dir + '/' + req.headers.directory
    }

    fs.readdir(__dirname + dir, {withFileTypes: true},function(err, items) {
        console.log(items)
        var filelist = []
        
        if (!items) {
            res.status(404).send('No files in ' + dir)
            return
        }
        items.forEach( file => {
            filelist.push({ name: file.name, isDirectory: file.isDirectory() })
        })
        res.status(200).send(JSON.stringify(filelist))
    });
})

app.post('/api/post/mkdir', function (req, res) {
    if (!authenticate(res, req.headers.username, req.headers.password)) {
        return false
    }

    if (!req.query.dirname) {
        res.status(200).send('Please specify the directory as the parameter \'dirname\'');
        return
    }

    var dir_to_make = __dirname + '/' + req.headers.username + '/' + req.query.dirname

    fs.mkdir(dir_to_make, { recursive: true }, (err) => {
        if (err) {
            console.log(err)
            //todo throw error to user
            return
        }
        else {
            console.log('create directory ' + dir_to_make)
            res.status(201).send(req.headers.username + '/' + req.query.dirname + ' successfully created');
        }
    });

})

app.post('/api/post/:filename', function (req, res) {

    if (!authenticate(res, req.headers.username, req.headers.password)) {
        return false
    }
    var fname = req.params.filename;

    if(req.headers.directory) {
        fname = req.headers.directory + '/' + fname
        console.log('new fname ' + fname)
    }

    fname = '/' + req.headers.username + '/' + fname

    var fstream;

    if (!req.busboy) {
        res.status(200).send('Please include a file');
        return
    }

    req.pipe(req.busboy);
    
    req.busboy.on('file', function (fieldname, file, filename) {

        if (req.params.filename != filename) {
            res.status(400).send('Filename must match in parameter and body')
            return
        }

        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + fname);
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename);              
            res.status(201).send(filename + ' successfully uploaded');
            //res.redirect('back');           //where to go next
        });
    });
})

app.listen(8080, () => console.log('Domscloud listening on port 8080!'))

// var http = require('http');
// http.createServer(function (req, res) {
//     switch (req.method) {
//         case 'GET':
//             res.writeHead(200, {'Content-Type': 'text/plain'});
//             res.sendFile('hello.txt');
//             res.close();

//             // var readStream = fs.createReadStream('hello.txt');
//             // // We replaced all the event handlers with a simple call to readStream.pipe()
//             // readStream.on('open', function() {
//             //     // This just pipes the read stream to the response object (which goes to the client)
//             //     readStream.pipe(res);
//             //     res.end();
//             // });
            
//             break;
//         case 'POST':
//             res.writeHead(200, {'Content-Type': 'text/plain'});
//             res.write('POST!');
//             res.end();
//             break;
//         default:
//             res.writeHead(200, {'Content-Type': 'text/plain'});
//             res.write('Bad Request!');
//             res.end();
//             break;
//     }
//     console.log(req.method);
//     console.log(req.url);
//     // res.writeHead(200, {'Content-Type': 'text/plain'});
//     // res.write('Hello World!');
//     // res.end();
// }).listen(8080);