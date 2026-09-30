// Cucumber runner configuration
module.exports = {
  default: {
    requireModule: ['ts-node/register'],           // run TypeScript directly
    require: ['src/support/**/*.ts', 'src/steps/**/*.ts'], // world, hooks, step defs
    paths: ['features/**/*.feature'],              // where feature files live
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    parallel: 1,                                   // increase for parallel runs
    retry: 0,
  },
};
