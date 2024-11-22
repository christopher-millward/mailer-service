import type { Config } from 'jest';

const config: Config = {
    roots: ['<rootDir>/src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|.*\/)(test)\.tsx?$',  // Update regex to include '.test'
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    verbose: true,
};

export default config;
