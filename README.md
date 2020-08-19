## ENVGATE (ENV for Fargate)

Simple tool which allows to replace fields within a file with the interpolate syntax. 

    {
	    "NAME": "Erik",
	    "STATEMENT": "Hello ${NAME}!"
    }
   Will become 
   
    {
	    "NAME": "Erik",
	    "STATEMENT": "Hello Erik!"
    }

## Why?
This project was made for Fargate but can really be used anywhere. It allows you to easily replace and update env varibles with ease. 

If you wish to insert values based on you env in you fargate you can use the command 

envgate --target task-definition.json --fields .aws-config.json --env STAGE production

    {
    "executionRoleArn": "arn:aws:iam::${AWS_PROFILE}:role/${ROLE_NAME}-$STAGE",
    "name": "${FARGATE_NAME}",
    "ulimits": [],
    "dnsServers": [],
    "mountPoints": [],
    "dockerSecurityOptions": [],
    "volumesFrom": [],
    "image": "${IMAGE_NAME}"
    }


## Commands

**-t, --target [string] (required)**
Path for the target file. This file is where the fields will be replaced. It will filter out any fields that are not within this json.

**-o, --output [string]**
Path for the outputted file 

**-f, --fields <string...>** 
Path for the fields files which should be able to replace. You can include more files than you target to easy be able to edit the fields you wish to replace. You can add more than one fields files per command. You can have a structure like this.

/config.json<br>/config.prod.json<br>/config.staging.json<br>/target.json<br>

When building for a staging environment

    envgate -f config.json -f config.staging.json -t target.json

And when building for a prod environment

    envgate -f config.json -f config.prod.json -t target.json


**-e, --env <string...>**
Extra enviroment varibles. You can add extra varibles which are part of the replace protocol. 
Should be use in the following way 

    envgate -e <KEY> <VALUE> --target target.json

If you have a specific stage or similiair it can be easy to just add the stage as a seperate varible.

    envgate -f config.json -e STAGE prod -t target.json

**-g, --get [string]**
Get a certain value in the env instead of building the output file


**-pe, --process-env**
Uses the env varibles within the project aswell