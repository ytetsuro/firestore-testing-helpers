module.exports = {
  /*setupFilesAfterEnv: [
    './TestBootstrap.ts',
  ],*/
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
