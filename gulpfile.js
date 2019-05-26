(function gulpfile() {
   "use strict";

   // gulp bits
   const {
      src, dest,
      series, parallel
   } = require("gulp");

   // added requires

   // vars
   const PATHS = {
      PACKAGE_LOCK: "package-lock.json"
   };

   // tasks
   const noOpTask = (cb) => { console.log("no-op"); cb(); };

   const lint = (...args) => { console.log("lint"); return noOpTask(...args); };
   const test = (...args) => { console.log("test"); return noOpTask(...args); };
   const tdd = (...args) => { console.log("tdd"); return noOpTask(...args); };

   const cleanDocs = (...args) => { console.log("cleanDocs"); return noOpTask(...args); };
   const buildDocs = (...args) => { console.log("buildDocs"); return noOpTask(...args); };
   const runDocs = (...args) => { console.log("runDocs"); return noOpTask(...args); };

   const clean = (...args) => { console.log("clean"); return noOpTask(...args); };
   const build = (...args) => { console.log("build"); return noOpTask(...args); };


   // public api
   exports.lint = lint;
   exports.test = test;
   exports.tdd = tdd;
   exports.qa = series(lint, test);

   exports.cleanDocs = cleanDocs;
   exports.buildDocs = series(cleanDocs, buildDocs);
   exports.runDocs = series(cleanDocs, buildDocs, runDocs);

   exports.clean = clean;
   exports.build = series(clean, build);

   exports.fullClean = parallel(clean, cleanDocs);
   exports.fullBuild = series(parallel(series(lint, test), clean), build)
   exports.fullRunDocs = series(parallel(series(lint, test), clean, cleanDocs), parallel(build, buildDocs), runDocs);

   exports.default = noOpTask;
}());