import dotenv from 'dotenv';

// parsing the env file

dotenv.config({ path: '.env' });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all
interface ENV {
    TOKENS: string | undefined
    PROXIES: string | undefined
}

interface Config {
    TOKENS: string[]
    PROXIES: string[]
}

// Loading process.env as ENV interface
const getConfig = (): ENV => {
    return {
        TOKENS: process.env.TOKENS,
        PROXIES: process.env.PROXIES
    };
}

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitizedConfig = (config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in .env file`);
        }
    }

    const newConfig = config as any;
    newConfig.TOKENS = config.TOKENS ? config.TOKENS.split(', ') : [];
    newConfig.PROXIES = config.PROXIES ? config.PROXIES.split(', ') : [];

    return newConfig as Config;
};



const config = getConfig();

const env = getSanitizedConfig(config);

export default env;
