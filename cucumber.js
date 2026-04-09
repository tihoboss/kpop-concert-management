// cucumber.js (для версии 10+)
module.exports = {
    default: {
        require: ['tests/step_definitions/*.js'],
        format: ['progress', 'json:reports/cucumber_report.json'],
        paths: ['tests/features/'],
        timeout: 30000,
        retry: 1,
        // Для версии 10+ нужно указать формат модулей
        import: ['tests/step_definitions/*.js']
    }
};