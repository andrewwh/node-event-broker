const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const watch = require('gulp-watch');
const rename = require('gulp-rename');
const project = typescript.createProject('tsconfig.json', {declaration: true});
const concat = require('gulp-concat');
const spawn = require('child_process').spawn;
const tslint = require("gulp-tslint");

const base = "./";
var paths = {
  source: base + 'src/',
  target: base + 'build'
};

var node;
gulp.task('server', ['compile'], (cb) => {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['index.js'], {stdio: 'inherit', cwd: paths.target});
  node.on('close', (code) => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });

  cb();
})

gulp.task('debug', ['compile'], (cb) => {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['--nolazy', '--inspect-brk=9229', 'index.js'], {stdio: 'inherit', cwd: paths.target});
  node.on('close', (code) => {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });

  cb();
})

gulp.task('develop', ['server'], () => {
  return gulp.watch([paths.source + '**/*.ts', paths.source + '**/*.json'], ['server']);
});

process.on('exit', function() {
    if (node) {
      node.kill();
    }
});

gulp.task('clean', () => {
  return del([paths.target + "/**/*"], {force:true});
});

gulp.task("lint", () =>
  gulp.src("src/**/*.ts")
      .pipe(tslint({
          formatter: 'stylish'
      }))
      .pipe(tslint.report({
        emitError: false
    }))
  );

gulp.task('copy-assets', () => {
  return gulp
    .src([paths.source + '**/*.json', 
          base + 'package.json',
          paths.source + '**/*.yaml', 
          paths.source + '**/*.wsdl', 
          paths.source + '**/*.properties', 
          paths.source + '**/*.xsd'], { base : paths.base })
    .pipe(gulp.dest(paths.target));
});

gulp.task('compile', ['copy-assets'], () => {
    return project.src()
            .pipe(project()).js
            .pipe(gulp.dest(paths.target)); 
});


gulp.task('watch', () => {
  return gulp.watch(paths.source + '**/*.ts', { interval: 1000 }, ['compile']);
});

gulp.task('default', ['compile']);