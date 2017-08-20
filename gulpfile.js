const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const combiner = require('stream-combiner2');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const webpackConfig = {
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
                presets: ['es2015'],
            },
        }],
    },
    output: {
        filename: 'index.js',
        libraryTarget: 'umd',
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin(),
    ],
};

const colors = gutil.colors;

// 错误捕捉
const handleError = function handleError(err) {
    console.log('\n');
    gutil.log(colors.red('Error!'));
    gutil.log(`fileName: ${colors.red(err.fileName)}`);
    gutil.log(`lineNumber: ${colors.red(err.lineNumber)}`);
    gutil.log(`message: ${err.message}`);
    gutil.log(`plugin: ${colors.yellow(err.plugin)}`);
};

// 清空 ./dist 目录
gulp.task('clean', () => del(['./dist/**']));

// 复制所有 json 文件
gulp.task('json', () => gulp.src('./src/**/*.json').pipe(gulp.dest('./dist')));

// 复制 ./src/assets 文件夹下的所有资源
gulp.task('assets', () => gulp.src('./src/assets/**').pipe(gulp.dest('./dist/assets')));

// 复制 wxml 文件
gulp.task('templates', () => gulp.src('./src/**/*.wxml').pipe(gulp.dest('./dist')));

// 打包 npm 依赖
gulp.task('npm', () => {
    gulp.src('./src/npm/*.js')
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(gulp.dest('./dist/npm'));
});

// 监听文件变化
gulp.task('watch', () => {
    gulp.watch('./src/**/*.json', ['json']);
    gulp.watch('./src/assets/**', ['assets']);
    gulp.watch('./src/**/*.wxml', ['templates']);
    gulp.watch('./src/**/*.wxss', ['wxss']);
    gulp.watch('./src/**/*.scss', ['wxss']);
    gulp.watch('./src/**/*.js', ['scripts']);
    gulp.watch('./src/npm/*.js', ['npm']);
});

// 编译 样式 文件
gulp.task('wxss', () => {
    const combined = combiner.obj([
        gulp.src(['./src/**/*.{wxss,scss}', '!./src/styles/**']),
        sass().on('error', sass.logError),
        rename(path => path.extname = '.wxss'),
        gulp.dest('./dist'),
    ]);

    combined.on('error', handleError);
});

// 编译 JS 文件
gulp.task('scripts', () => {
    gulp.src(['./src/**/*.js', '!./src/npm/*.js'])
        .pipe(babel({
            presets: ['es2015'],
        }))
        .pipe(gulp.dest('./dist'));
});

// 开发模式命令
gulp.task('dev', ['clean'], () => runSequence('json', 'assets', 'templates', 'wxss', 'scripts', 'watch', 'npm'));