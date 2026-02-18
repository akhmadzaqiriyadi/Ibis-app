module.exports = {
    apps: [
        {
            name: 'kewirausahaan-backend',
            cwd: './backend',
            script: 'src/index.ts',
            interpreter: 'bun',
            env: {
                PORT: 2202,
                NODE_ENV: 'production',
            }
        },
        {
            name: 'kewirausahaan-frontend',
            cwd: './frontend',
            script: 'npm',
            args: 'start -- -p 3001',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
