# Aquarius Social Media App
Simple social media app built with MySQL, Node.js, Express, React and Docker.
***

## Start the app with Docker
Just execute this command in the root directory of the project:

`docker-compose up`

Docker will pull all images, create the containers and start all the services required to start the app.
Wait until all the containers are up and the **database migration process is complete**, then you can access the app with the endpoints listed below.

To manually migrate the database, first get inside the API container:

`docker exec -it aquarius-api-dev sh`

Then execute this command to start the migration process:

`npm run migrate:up`

If you want to read server logs:

`docker logs -f aquarius-api-dev`

Or replace `aquarius-api-dev` with any other container you want to read logs from.

***

## Endpoints
|Service|Endpoint|
|--------|---------------------|
|MySQL|http://localhost:3306|
|API|http://localhost:5000|
|Frontend|http://localhost:3050|
|Adminer|http://localhost:8080|

## Users
|Username|Email|Password|
|--------|---------------|--------|
|admin|admin@aquarius.com|admin|
|user2|user2@aquarius.com|12345678|
|user3|user3@aquarius.com|12345678|
|user4|user4@aquarius.com|12345678|
|user5|user5@aquarius.com|12345678|
|user6|user6@aquarius.com|12345678|
|user7|user7@aquarius.com|12345678|
|user8|user8@aquarius.com|12345678|