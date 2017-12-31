var gulp = require('gulp');

gulp.task('default', function () {
    // place code for your default task here
});

gulp.task('watchSass', function () {
    gulp.watch(['app/**/*.scss', '!app/bower_components/**/*.scss'], ["injectSass"]);
});

// SCSS

var nodeSass = require('node-sass');
var path = require('path');
var fs = require('fs');
var map = require('map-stream');
var srcPath = 'src/';
var buildPath = 'build/';
var buildSrcPath = path.join(buildPath, 'target')

gulp.task('injectSass', function () {
    return gulp.src([srcPath + '/components/**/*.html'])
        .pipe(map(function (file, cb) {
            var injectString = '<!-- inject{scss} -->';
            // convert file buffer into a string
            var contents = file.contents.toString();
            if (contents.indexOf(injectString) >= 0) {
                //Getting scss
                var scssFile = file.path.replace(/\.html$/i, '.scss');
                fs.readFile(scssFile, function (err, data) {
                    if (!err && data) {
                        nodeSass.render({
                            data: data.toString(),
                            includePaths: [path.join(srcPath, 'style/')],
                            outputStyle: 'compressed'
                        }, function (err, compiledScss) {
                            if (!err && compiledScss) {
                                file.contents = new Buffer(contents.replace(injectString, compiledScss.css.toString()), 'binary');
                            }
                            return cb(null, file);
                        });
                    }
                    return cb(null, file);
                });
            } else {
                // continue
                return cb(null, file);
            }
        }))
        .pipe(gulp.dest(path.join(buildSrcPath, 'components')));
});