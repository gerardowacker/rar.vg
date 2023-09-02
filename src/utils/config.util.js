import config from "../../config/config.json";

export default key =>
{
    return process.env !== null ? process.env[key] : config[key]
}