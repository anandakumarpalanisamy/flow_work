/*
 * This is the file that tells gulp - what to do .. when it runs.
 * Node JS require command to import the gulp library and assign to variable to 'gulp'.
 * gulp plugin that helps in logging.
 * gulp plugin to process the Coffee Scripts. 
 * Browserify lets us add our libraries as our dependencies.
 * Compass plugin helps us with processing the sass files.
 */
var gulp = require('gulp'), 
    gutil = require('gulp-util'), 
    coffee = require('gulp-coffee'), 
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat');


var coffeeSources = ['components/coffee/tagline.coffee'];

var jsSources = ['components/scripts/rclick.js',
                'components/scripts/pixgrid.js',
                'components/scripts/tagline.js',
                'components/scripts/template.js'];

var sassSources = ['components/sass/style.scss'];

var htmlSources = ['builds/development/*.html'];

var jsonSources = ['builds/development/js/*.json'];

/* You create a task using the task() method.
 * 1. gulp.src() == Tells gulp - where the source files are.
 * 2. Now pipe the content to the src method, to coffee module with pipe() method.
 * 3. Now right on the coffee plugin - expect for any error by executing an ".on" error, 
 * so that any error in coffee plugin - doesn't break the whole gulp script.
 * 4. Take the result of the coffee command and pipe it somewhere else.
 * 5. gulp.dest variable => means where we need to send the processed files.
 * 
 */
gulp.task('coffee', function(){    
    gulp.src(coffeeSources)
    .pipe(coffee({bare: true})
         .on('error', gutil.log))
    .pipe(gulp.dest("components/scripts"))
    
});

/*
 * Output of the gulp.src() goes in to the 
 * pipe.concat('script.js'). This process all
 * the java script files and concat them 
 * as one java script file script.js. Once processed move
 * it into builds/development.js.
 */
gulp.task('js', function(){

    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulp.dest('builds/development/js'))
        .pipe(connect.reload())
});

/*
 * My source is called "sassSources". Then
 * pipe it to the Compass plugin. On error do a logging using the
 * gulp util plugin.
 * 
 * Options for the Compass are defined as java script object.
 * Tell where the sass files are. (sass attribute)
 * Then, tell where the images are. (image attribute)
 * (style attribute - designates how the generated css files 
 * should like. This is a best fit for the Development 
 * purposes.)
 * 
 */ 
gulp.task('compass', function(){
    gulp.src(sassSources)
        .pipe(compass({
            sass: 'components/sass',
            image: 'builds/development/images',
            style: 'expanded'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest('builds/development/css'))
        .pipe(connect.reload())
});


gulp.task('watch', function(){
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch(htmlSources, ['html']);
    gulp.watch(jsonSources, ['json']);
    gulp.watch('components/sass/*.scss', ['compass']);
});


gulp.task('connect', function(){
    connect.server({
        root: 'builds/development/',
        livereload: true
    });
});

gulp.task('html', function(){
    gulp.src(htmlSources)
        .pipe(connect.reload())
});

gulp.task('json', function(){
    gulp.src('builds/development/js/*.json')
        .pipe(connect.reload())
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'watch', 'connect']);