module.exports = {
  preset: 'jest-preset-next',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/integration/**/*.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/app/api/**/*.js',
    '!src/app/api/**/__tests__/**',
  ],
}
