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
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHtml = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    pngcrush = require('imagemin-pngcrush'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat');


var env, coffeeSources, jsSources, sassSources, htmlSources, jsonSources, outputDir, sassStyle;

env = process.env.NODE_ENV || 'production';

if(env ==='development'){
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}


coffeeSources = ['components/coffee/tagline.coffee'];

jsSources = ['components/scripts/rclick.js',
                'components/scripts/pixgrid.js',
                'components/scripts/tagline.js',
                'components/scripts/template.js'];

sassSources = ['components/sass/style.scss'];

htmlSources = ['builds/development/*.html'];

jsonSources = ['builds/development/js/*.json'];

imageSources = ['builds/development/images/**/*.*'];

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
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
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
            image: outputDir + 'images',
            style: sassStyle
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload())
});


gulp.task('watch', function(){
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch(jsonSources, ['json']);
    gulp.watch(imageSources, ['images']);
    gulp.watch('components/sass/*.scss', ['compass']);
});


gulp.task('connect', function(){
    connect.server({
        root: outputDir,
        livereload: true
    });
});

gulp.task('html', function(){
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHtml()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload())

});


gulp.task('images', function(){
    gulp.src(imageSources)
    .pipe(gulpif(env === 'production', imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});

gulp.task('json', function(){
    gulp.src(jsonSources)
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload())
});

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'watch', 'connect']);