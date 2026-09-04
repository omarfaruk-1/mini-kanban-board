import {PrismaNeon} from "@prisma/adapter-neon";
import {PrismaClient} from "@prisma/client";
import appConfig from "../config/appConfig.js";


const connectionString = appConfig.DATABASE_URL;
const adapter = new PrismaNeon({connectionString});
const prisma = new PrismaClient({adapter});


export default prisma;
