module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/src/**/*.test.ts',
    '**/src/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
} 