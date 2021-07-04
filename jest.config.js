module.exports = {
  setupFilesAfterEnv: [
    './src/__tests__/Bootstrap.ts',
  ],
  roots: [
    '<rootDir>/src',
  ],
  testMatch: [
    '**/__tests__/**/?(*.)+(spec|test).(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
}
