
// npm install -g gulp
// npm install --save-dev gulp gulp-util gulp-uglify gulp-concat gulp-minify-css


var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
// var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');

gulp.task('js', function () {
    gulp.src(['../public/assets/jquery.fbdialog.js', '../public/assets/main.js'])
        .pipe(uglify())
        .pipe(concat('pkg.min.js'))
        .pipe(gulp.dest('../public/assets'));
});
gulp.task('css', function () {
    gulp.src(['../public/assets/style.css', '../public/assets/jquery.fbdialog.css'])
        .pipe(minifyCSS())
        .pipe(concat('pkg.min.css'))
        .pipe(gulp.dest('../public/assets'));
});

// gulp build
gulp.task('build', ['css', 'js']);

// gulp.task('default', ['', '']); // 默认任务