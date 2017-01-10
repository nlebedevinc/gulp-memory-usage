'use strict';

const gulp = require('gulp-help')(require('gulp'));
const size = require('gulp-size');
const del = require('del');
const git = require('gulp-git');
const shell = require('gulp-shell');
const file = require('gulp-file');
const merge = require('merge-stream');

// node deps
const fs = require('fs');
const path = require('path');
const utils = require('./app/utils');

var appOptions = {};
const config = require('./gulp.config');
config(appOptions);

var report = [];
var totalSize = 0;

/**
* @function {function name}
* @param  {String} 'size' task
* @param  {type} function( {description}
* @return {type} {description}
*/
gulp.task('size', function() {
    var folders = utils.getFolders(appOptions.dir);
    var tasks = folders.map(function(name) {
        var s = size();
        return gulp.src(appOptions.dir + '/' + name + '/**/*.*')
            .pipe(s)
            .on('end', function() {
                totalSize += s.size;
                report.push(name + ': memory size -> ' + s.size + ' B | ' + s.prettySize);
            });
    });
    return merge(tasks);
});

gulp.task('report', ['size'], function() {
    var content = utils.reportString(report, totalSize);
    return utils.writeRegistry("report.txt", content)
        .pipe(gulp.dest('dist'));
});

gulp.task('registry', function() {
    var content = 'registry=' + appOptions.registry;
    var tasks = appOptions.packages.map(function (name) {
        return writeRegistry(".npmrc", content)
            .pipe(gulp.dest(appOptions.dir + '/' + name));
    });
    return merge(tasks);
});

gulp.task('install:production', shell.task(
    utils.prepareInstall('npm i --production')
));

gulp.task('install:all', shell.task(
    utils.prepareInstall('npm i')
));

gulp.task('clean', function() {
    appOptions.packages.forEach((name) => {
        var dirsToDel = getDirs(appOptions.dir + '/' + name +'/node_modules', [], appOptions.removePattern);
        dirsToDel.forEach((path) => {
            del([path + '/**'], {force: true}).then(paths => {
                console.log('Deleted files and folders:\n', paths.join('\n'));
            });
        });
    });
});

gulp.task('clone', function() {
    appOptions.packages.forEach((name) => {
        git.clone(appOptions.repo + '/' + name + '.git', {args: appOptions.dir + '/' + name}, function(err) {
            if (err) throw err;
        })
    });
});
