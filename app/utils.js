'use strict';

const fs = require('fs');
const eol = require('os').EOL;
const path = require('path');
const util = require('gulp-util');
const config = require('../gulp.config');

var appOptions = {};
config(appOptions);

const MB = 1000000;

exports.getFolders = function (dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
};

exports.getDirs = function (dir, fileList, pattern){
    fileList = fileList || [];

    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            if (files[i].indexOf(pattern) != -1) {
                fileList.push(name);
            } else {
                getDirs(name, fileList, pattern);
            }
        }
    }
    return fileList;
};

exports.writeRegistry = function (filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new util.File({
            cwd: "",
            base: "",
            path: filename,
            contents: new Buffer(string)
        }));
        this.push(null)
    };
    return src;
};

exports.reportString = function (report, totalSize) {
    var content = config.title + ':' + eol;
    content += report.map((data) => {
        return data + eol;
    });
    content += 'Total size: ' + totalSize / MB + ' MB';
    return content;
};

exports.prepareInstall = function (mode) {
    return appOptions.packages.map((name) => {
        return 'cd ' + appOptions.dir + '/' + name + ' && ' + mode;
    });
};
