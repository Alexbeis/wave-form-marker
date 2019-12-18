/* Basic gulp concat and minify didesweb.com */
const { src, dest, watch, series, parallel } = require('gulp');
const concat    = require('gulp-concat');
const uglify    = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
let replace = require('gulp-replace');

// File paths
const files = { 
  cssPath: 'src/css/*.css',
  jsPath: 'src/js/**/*.js',
  //jsPathUI: 'src/js/Ui/*.js'
}

// JS task: concatenates and uglifies JS files to app.js

function jsTask(){
  return src([
      'src/js/Ui/*.js',
      'src/js/Track.js',
      'src/js/WaveformMarker.js',
      'src/js/Player.js',
      'src/js/index.js'


      ])
      .pipe(concat('app.js'))
      //.pipe(uglify())
      .pipe(dest('dist')
  );
}

// Sass task: compiles the style.scss file into style.css
function cssTask(){    
  return src([
    'node_modules/bootstrap/dist/css/bootstrap.css',
    files.cssPath
      ],
      {base:'node_modules'})
      .pipe(concat('app.css'))
      .pipe(sourcemaps.init()) // initialize sourcemaps first
      .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
      .pipe(dest('dist')
  ); // put final CSS in dist folder
}

// Cachebust
let cbString = new Date().getTime();
function cacheBustTask(){
    return src(['index.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
        .pipe(dest('.'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
    watch([files.cssPath,files.jsPath], 
        series(
            parallel(cssTask, jsTask),
            cacheBustTask
        )
    );    
}

// Run: "yarn run gulp"
exports.default = series(
  parallel(cssTask, jsTask), 
  cacheBustTask,
  watchTask
);


