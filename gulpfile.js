const { src, dest, series, watch } = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const sasstocss = require('gulp-sass')(require('node-sass'));

const gulpif = require('gulp-if');
const argv = require('yargs').argv;

const clean = () => {
    return del(['dist'])
}

const styles = () => {
    return src(['./src/css/normalize.css', 
        './src/css/stylescss.scss', './src/css/media.scss'])
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(concat('style.scss'))
        .pipe(sasstocss().on('error', sasstocss.logError))
        .pipe(autoprefixer(
            { cascade: false }
        ))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(sourcemaps.write())
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

const resources = () => {
    return src('./src/resources/**')
        .pipe(dest('./dist'))
}

const images = () => {
    return src([
        './src/img/**.jpg',
        './src/img/**.jpeg',
        './src/img/*.svg',
        './src/img/**/*.jpg',
        './src/img/**/*.jpeg'
    ])
        .pipe(imagemin())
        .pipe(dest('./dist/img'))
};

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
    })
};

watch('./src/css/**/*.css', styles);
watch('./src/*.html', htmlMinify);
watch('./src/resources/**', resources);
watch('./src/img/*.{jpg,jpeg,png,svg}', images);
watch('./src/img/**/*.{jpg,jpeg,png}', images);

exports.clean = clean;
exports.styles = styles;
exports.htmlMinify = htmlMinify;
exports.images = images;

exports.default = series(clean, styles, htmlMinify, resources, images, watchFiles);