# leesbare link

![Website logo](logo.png)

Starters project for the UCLL course *Cloud Native Engineering*
*leesbare link* is a website that allows you to create link mappings, just like bit.ly or other URL shorters. 
However, the purpose is not to shorten links, but to make them readable.

## How to run

Make sure you have docker running, and execute the `start.sh` script.

```shell
./start.sh
```

To stop the application, execute the `stop.sh` script.

```shell
./stop.sh
```

The application runs via *docker-compose* with the `docker-compose.yml` configuration in the root of the project.

## Architecture

This version of the application has migrated from MongoDB to Azure Cosmos DB. You can follow the steps of [this tutorial](https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/quickstart-nodejs?tabs=azure-portal%2Cpasswordless%2Cwindows%2Csign-in-azure-cli) to migrate your own application. For this application I've used the `Connection String` option to connect to Azure Cosmos DB.

The rest of the application still runs in Docker.