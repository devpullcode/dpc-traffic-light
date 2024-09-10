import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import gulpIf from 'gulp-if';

// css sass
import * as sassCompiler from 'sass';
import sassModule from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { appendText } from 'gulp-append-prepend';

// js
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import stripComments from 'gulp-strip-comments';

// images
import webp from 'gulp-webp';
import avif from 'gulp-avif';

const sass = sassModule(sassCompiler);
const isProduction = process.env.NODE_ENV === 'production';

/* ========== CSS ========== */
const compilerCSS = () => {
  return gulp
    .src('src/scss/main.scss', { allowEmpty: true })
    .pipe(gulpIf(!isProduction, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulpIf(!isProduction, sourcemaps.write('.')))
    .pipe(gulp.dest('build/css'));
};

// prettier-ignore
const processNormalizeCss = () => {
  return gulp
  .src('node_modules/normalize.css/normalize.css', { allowEmpty: true })
  .pipe(appendText('*,*::after,*::before {margin: 0;padding: 0;box-sizing: border-box;}'))
  .pipe(gulp.dest('build/css'));
};

const purgeCSS = async () => {
  const purgecss = (await import('@fullhuman/postcss-purgecss')).default;

  return gulp
    .src('build/css/main.css', { allowEmpty: true })
    .pipe(
      postcss([
        purgecss({
          content: ['./*.html', './src/js/*.js'],
          defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
      ]),
    )
    .pipe(gulp.dest('build/css'));
};

/* ========== JavaScript ========== */
const scripts = () => {
  return gulp.src('src/js/**/*.js').pipe(uglify()).pipe(stripComments()).pipe(concat('main.js')).pipe(gulp.dest('build/js'));
};

/* ========== IMG ========== */
let imagemin;
const movImgs = async () => {
  await loadImagemin();
  return gulp
    .src('src/img/**/*')
    .pipe((await import('gulp-imagemin')).default({ optimizationLevel: 7 }))
    .pipe(gulp.dest('build/img'));
};

const loadWebp = () => {
  return gulp.src('src/img/**/*.{png,jpg}').pipe(webp()).pipe(gulp.dest('build/img'));
};

const loadAvif = () => {
  return gulp
    .src('src/img/**/*.{png,jpg}')
    .pipe(avif({ quality: 50 }))
    .pipe(gulp.dest('build/img'));
};

const loadImagemin = async () => {
  if (!imagemin) {
    imagemin = (await import('gulp-imagemin')).default;
  }
};

/* ========== fontawesome ========== */
// prettier-ignore
const fontawesomeCss = () => {
  return gulp
    .src('node_modules/@fortawesome/fontawesome-free/css/all.min.css', { allowEmpty: true })
    .pipe(replace('../webfonts', '../fonts/fontawesome-fonts'))
    .pipe(rename('fontawesome.css'))
    .pipe(gulp.dest('build/css'));
};

const fontawesomeFonts = () => {
  return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*', { allowEmpty: true }).pipe(gulp.dest('build/fonts/fontawesome-fonts'));
};

/* ========== watch file ========== */
const watchFile = done => {
  gulp.watch('src/scss/**/*.scss', compilerCSS);
  gulp.watch('src/img/**/*', movImgs);
  gulp.watch('src/img/**/*', loadWebp);
  gulp.watch('src/img/**/*', avif);
  gulp.watch('src/js/**/*.js', scripts);

  done();
};

export { compilerCSS, movImgs, loadWebp, loadAvif, fontawesomeFonts, fontawesomeCss, buildForDeploy, watchFile };

const buildForDeploy = gulp.series(gulp.parallel(scripts, movImgs, loadWebp, loadAvif, fontawesomeFonts, fontawesomeCss), compilerCSS, purgeCSS, processNormalizeCss);

export default gulp.series(buildForDeploy, watchFile);
