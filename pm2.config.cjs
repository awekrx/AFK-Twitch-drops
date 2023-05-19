module.exports = {
    apps: [{
        name: "Twitch Bot viewer",
        script: "./dist/index.js",
        exec_mode: "cluster",
        out: "log/pm2.log",
        node_args: "--experimental-json-modules"
    }]
};