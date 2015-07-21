var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var sequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ghPages = require('gulp-gh-pages');

// UI JavaScript
var uiJS = ['bower_components/chico/dist/ui/chico.js'];

// Mobile JavaScript
var mobileJS = ['bower_components/chico/dist/mobile/chico.js'];

// Path where is located the Bourbon source
var bourbonPath = 'bower_components/bourbon/app/assets/stylesheets/';

// Cleans the build directory
gulp.task('clean', function (cb) {
    rimraf('./build', cb);
});

// Copies theme related assets
gulp.task('copy:assets', function () {
    // Everything in the assets folder
    return gulp
        .src(['./bower_components/chico/src/shared/assets/**/*.*'], {
            base: './bower_components/chico/src/shared/'
        })
        .pipe(gulp.dest('./build'));
});
gulp.task('copy:mesh', function () {
    return gulp
        .src(['./bower_components/mesh/index.css'], {
            base: './bower_components/mesh/'
        })
        .pipe(gulp.dest('./build/mesh'));
});
gulp.task('copy:views', function () {
    return gulp
        .src(['./src/views/*.html'], {
            base: './src/views/'
        })
        .pipe(gulp.dest('./build'));
});
gulp.task('copy', [
    'copy:views',
    'copy:mesh',
    'copy:assets'
]);

// Compiles Sass for the theme
gulp.task('sass', [
    'sass:theme:ui',
    'sass:theme:mobile'
]);

// Compiles Sass Ui for the theme
gulp.task('sass:theme:ui', function () {
    return gulp.src('src/styles/theme-ui.scss')
        .pipe($.sass({
            includePaths: [bourbonPath]
        }))
        .pipe($.rename('theme.css'))
        .pipe(gulp.dest('./build/ui/'))
        .pipe(reload({stream: true}));
});

gulp.task('sass:theme:mobile', function () {
    return gulp.src('src/styles/theme-mobile.scss')
        .pipe($.sass({
            includePaths: [bourbonPath]
        }))
        .pipe($.rename('theme.css'))
        .pipe(gulp.dest('./build/mobile/'))
        .pipe(reload({stream: true}));
});

// Compiles and copies Chico's JavaScript and it's dependencies
gulp.task('uglify', [
    'uglify:theme:ui',
    'uglify:theme:mobile'
]);

// UI JavaScript
gulp.task('uglify:theme:ui', function () {
    return gulp.src(uiJS)
        .pipe($.uglify({
            beautify: true,
            mangle: false
        }).on('error', function(e) {
            console.log(e);
        }))
        .pipe($.concat('ui.js'))
        .pipe(gulp.dest('./build/ui/'));
});

// Mobile JavaScript
gulp.task('uglify:theme:mobile', function () {
    return gulp.src(mobileJS)
        .pipe($.uglify({
            beautify: true,
            mangle: false
        }).on('error', function(e) {
            console.log(e);
        }))
        .pipe($.concat('mobile.js'))
        .pipe(gulp.dest('./build/mobile/'));
});

// Starts a BrowserSync server, which you can view at http://localhost:3040
gulp.task('browser-sync', ['build'], function () {
    browserSync.init({
        port: 3040,
        startPath: '/ui.html',
        server: {
            baseDir: [
                './build/'
            ]
        }
    });

    gulp.watch('build/*.js').on('change', reload);
    gulp.watch('src/views/*.html', ['copy:views']);
    gulp.watch('build/*.html').on('change', reload);
    gulp.watch('src/styles/*.scss', ['sass']);
});

// Publish to gh-pages
gulp.task('deploy', function() {
    return gulp.src('./build/**/*')
        .pipe(ghPages());
});

// Builds all files without starting a server
gulp.task('build', function () {
    return sequence('clean', [
        'copy',
        'sass',
        'uglify'
    ], function () {
        console.log('The theme was successfully built.');
    });
});

// Default task: builds your theme and starts a server
gulp.task('default', [
    'build',
    'browser-sync'
]);
